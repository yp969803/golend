package helper

import(
	"github.com/gorilla/websocket"

)
type Hub struct {
	clients     map[*Client]bool
	register    chan *Client 
	unregister  chan *Client 
}

type Client struct{
	hub                   *Hub
	websocketConnection   *websocket.Conn
	username              string
	send                  chan SocketEventStruct
	email                 string
}

type SocketEventStruct struct{
	EventName  string
	EventPayload interface{}
}



func NewHub() *Hub{
	return &Hub{
		register:  make(chan *Client),
        unregister: make(chan *Client),
		clients:    make(map[*Client]bool),

	}
}

func (hub *Hub) Run() {
    for {
        select {
        case client := <-hub.register:
            HandleUserRegisterEvent(hub, client)

        case client := <-hub.unregister:
            HandleUserDisconnectEvent(hub, client)
        }
    }
}