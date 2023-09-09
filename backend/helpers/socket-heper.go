package helper

import (
	"bytes"
	"encoding/json"
	"log"
	"time"
	"golend/backend/models"
	"context"
	"golend/backend/database"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson"
	
    "go.mongodb.org/mongo-driver/mongo"
)

const (
	writeWait     = 10*time.Second
	pongWait     = 60*time.Second
	pingPeriod    = (pongWait*9)/10
	maxMessageSize = 512
)

type JoinDisconnectPayload struct {
    Email string   `json:"userID"`
    Users  []UserStruct `json:"users"`
}

type UserStruct struct{
      Username   string
	  Email    string
}

var messageCollection *mongo.Collection = database.OpenCollection(database.Client, "message")
var onlineCollection *mongo.Collection = database.OpenCollection(database.Client,  "online")

func CreateNewSocketUser(hub *Hub, connection *websocket.Conn, email string, username string){
	
	client := &Client{
		hub:                     hub,
		websocketConnection:      connection,
		send:                    make(chan SocketEventStruct),
		username:                 username,
		email:                    email,
	}
	go client.writePump()
	go client.readPump()

	client.hub.register<- client
}

func HandleUserRegisterEvent(hub *Hub , client *Client){
	var ctx, _= context.WithTimeout(context.Background(),100*time.Second)
    var online models.Online 
	hub.clients[client]=true
	handleSocketPayloadEvents(client, SocketEventStruct{
		EventName:     "join",
		EventPayload:  client.email,
	})
	email:= client.email 
	
    filter := bson.D{{"email", email}}
   
    err := onlineCollection.FindOne(ctx, filter).Decode(&online)
    online.Timestamp,_= time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
    if err != nil {
	if err == mongo.ErrNoDocuments {
		_, insertErr := onlineCollection.InsertOne(ctx, online)
        if insertErr!=nil{
           log.Println("Some error occured during updating online_at")
           return
        }
		return
	}
    log.Println(err)
    return
	
    } 
   
    update := bson.D{{"$set", bson.D{{"timestamp", online.Timestamp}}}}
    _, err = onlineCollection.UpdateOne(ctx, filter, update)
     if err != nil {
	    log.Println(err)
        return
    }
	


}

func HandleUserDisconnectEvent(hub *Hub, client *Client){
	var ctx,_= context.WithTimeout(context.Background(),100*time.Second)
     
	_, ok:= hub.clients[client]
	if ok{
		delete(hub.clients, client)
        close(client.send)
	}
	
	handleSocketPayloadEvents(client, SocketEventStruct{
		EventName:    "disconnect",
		EventPayload: client.email,
	})
	email:=client.email
    timestamp,_:= time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
	filter := bson.D{{"email", email}}
    update := bson.D{{"$set", bson.D{{"timestamp", timestamp}}}}
    _, err := onlineCollection.UpdateOne(ctx, filter, update)
    if err != nil {
	   log.Println("Some error while updating the online_at")
    }


}


func EmitToSpecificClient(hub *Hub, payload SocketEventStruct, email string,client *Client,textMessage string,id string){
    var ctx, _= context.WithTimeout(context.Background(),100*time.Second)
	var message models.Message 
	for client := range hub.clients{
		if client.email== email{
			select {
			case client.send <- payload :
			default:
				close(client.send)
				delete(hub.clients, client)
			}
		}
	}
	message.RecieverEmail=email
	message.SenderEmail=client.email
	message.Text=textMessage
	message.Timestamp,_=time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
	message.ID=id
    
    _, insertErr := messageCollection.InsertOne(ctx, message)
	if insertErr!=nil{
		log.Println("Some error during pushing message in database")
		return
	}

}

func BroadcastSocketEventToAllClient(hub *Hub, payload SocketEventStruct){
	for client := range hub.clients{
		select{
		case client.send <- payload:
		default:
			close(client.send)
			delete(hub.clients, client)
		}
	}
}

func handleSocketPayloadEvents(client *Client, socketEventPayload SocketEventStruct) {
    var socketEventResponse SocketEventStruct
    switch socketEventPayload.EventName {
    case "join":
        log.Printf("Join Event triggered")
        BroadcastSocketEventToAllClient(client.hub, SocketEventStruct{
            EventName: socketEventPayload.EventName,
            EventPayload: JoinDisconnectPayload{
                Email: client.email,
                Users:  getAllConnectedUsers(client.hub),
            },
        })

    case "disconnect":
        log.Printf("Disconnect Event triggered")
        BroadcastSocketEventToAllClient(client.hub, SocketEventStruct{
            EventName: socketEventPayload.EventName,
            EventPayload: JoinDisconnectPayload{
                Email: client.email,
                Users:  getAllConnectedUsers(client.hub),
            },
        })

    case "message":
        log.Printf("Message Event triggered")
        selectedUserID := socketEventPayload.EventPayload.(map[string]interface{})["email"].(string)
        messageId:=socketEventPayload.EventPayload.(map[string]interface{})["id"].(string)
        socketEventResponse.EventName = "message response"
		textMessage:=socketEventPayload.EventPayload.(map[string]interface{})["message"].(string)
        socketEventResponse.EventPayload = map[string]interface{}{
            "username":  getUsernameByUserID(client.hub, selectedUserID),
            "message" :  socketEventPayload.EventPayload.(map[string]interface{})["message"],
            "email"   :  selectedUserID,
            "id"      :  messageId,
            "sender_email":client.email,
        }
        EmitToSpecificClient(client.hub, socketEventResponse, selectedUserID,client,textMessage,messageId)
    }
}

func getUsernameByUserID(hub *Hub, email string) string {
    var username string
    for client := range hub.clients {
        if client.email == email {
            username = client.username
        }
    }
    return username
}

func getAllConnectedUsers(hub *Hub)[]UserStruct{
	var users []UserStruct
	for singleClient := range hub.clients{
		users= append(users,UserStruct{
			Username:  singleClient.username,
			Email:    singleClient.email,
		})
	}
	return users
}


func (c *Client) readPump() {
    var socketEventPayload SocketEventStruct

    defer unRegisterAndCloseConnection(c)

    setSocketPayloadReadConfig(c)

    for {
        _, payload, err := c.websocketConnection.ReadMessage()

        decoder := json.NewDecoder(bytes.NewReader(payload))
        decoderErr := decoder.Decode(&socketEventPayload)

        if decoderErr != nil {
            log.Printf("error: %v", decoderErr)
            break
        }

        if err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
                log.Printf("error ===: %v", err)
            }
            break
        }

        handleSocketPayloadEvents(c, socketEventPayload)
    }
}

func (c *Client) writePump() {
    ticker := time.NewTicker(pingPeriod)
    defer func() {
        ticker.Stop()
        c.websocketConnection.Close()
    }()
    for {
        select {
        case payload, ok := <-c.send:
            reqBodyBytes := new(bytes.Buffer)
            json.NewEncoder(reqBodyBytes).Encode(payload)
            finalPayload := reqBodyBytes.Bytes()

            c.websocketConnection.SetWriteDeadline(time.Now().Add(writeWait))
            if !ok {
                c.websocketConnection.WriteMessage(websocket.CloseMessage, []byte{})
                return
            }

            w, err := c.websocketConnection.NextWriter(websocket.TextMessage)
            if err != nil {
                return
            }

            w.Write(finalPayload)

            n := len(c.send)
            for i := 0; i < n; i++ {
                json.NewEncoder(reqBodyBytes).Encode(<-c.send)
                w.Write(reqBodyBytes.Bytes())
            }

            if err := w.Close(); err != nil {
                return
            }
        case <-ticker.C:
            c.websocketConnection.SetWriteDeadline(time.Now().Add(writeWait))
            if err := c.websocketConnection.WriteMessage(websocket.PingMessage, nil); err != nil {
                return
            }
        }
    }
}


func unRegisterAndCloseConnection(c *Client) {
    c.hub.unregister <- c
    c.websocketConnection.Close()
}

func setSocketPayloadReadConfig(c *Client) {
    c.websocketConnection.SetReadLimit(maxMessageSize)
    c.websocketConnection.SetReadDeadline(time.Now().Add(pongWait))
    c.websocketConnection.SetPongHandler(func(string) error { c.websocketConnection.SetReadDeadline(time.Now().Add(pongWait)); return nil })
}