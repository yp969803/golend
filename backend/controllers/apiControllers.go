package controllers


import(
	"context"
	
	"log"
	"net/http"

	"time"
	"github.com/gin-gonic/gin"
	// "github.com/go-playground/validator/v10"
	"golend/backend/database"
	// helper "gotut/jwt/helpers"
	"go.mongodb.org/mongo-driver/mongo/options"

    "golend/backend/models"
    "go.mongodb.org/mongo-driver/bson"
	
    "go.mongodb.org/mongo-driver/mongo"
    
	
	
    

)


type UserProfile struct{
	Email           string     `json:"email"`
	First_name      string      `json:"first_name"`
	Last_name       string      `json:"last_name"`
}

type MessageStruct struct{
	Text           string      `json:"text"`
}

var messageCollection *mongo.Collection= database.OpenCollection(database.Client,"message")
var onlineCollection *mongo.Collection= database.OpenCollection(database.Client,"online")

func GetProfile() gin.HandlerFunc {
	return func(c *gin.Context){

		var ctx, cancel= context.WithTimeout(context.Background(),100*time.Second)
		
		var userProfile UserProfile
		email:=c.Params.ByName("email")
        defer cancel()
		filter := bson.D{{"email", email}}
		err := userCollection.FindOne(ctx, filter).Decode(&userProfile)
        if err!=nil{
			if err == mongo.ErrNoDocuments {
				// This error means your query did not match any documents.
				c.JSON(http.StatusBadRequest,gin.H{"error":"No user with this email"})
				return
			}
			log.Println(err)
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Some error occured"})
			return 
		}
	
		c.JSON(http.StatusOK,userProfile)
		return

	}
	
}

func GetAllProfiles() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel= context.WithTimeout(context.Background(),100*time.Second)
		var users []UserProfile 
		defer cancel()
		cursor,err:= userCollection.Find(ctx,bson.M{})
		if err = cursor.All(ctx, &users); err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Some error occured"})

			return 
		}
		if err!=nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Some error occured"})

			return 
		}
		c.JSON(http.StatusOK,users)
		return
		

	}
}

func UpdateProfile() gin.HandlerFunc{
	return func(c *gin.Context){
		var user UserProfile
		var ctx, cancel= context.WithTimeout(context.Background(),100*time.Second)
		if err := c.BindJSON(&user);err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error":err.Error()})
			return
		}
		validationErr:= validate.Struct(user)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest,gin.H{"error":validationErr.Error()})
			return
		}
		email:= c.GetString("email")
		if email!= user.Email {
			c.JSON(http.StatusBadRequest,gin.H{"error":"You dont have right to update this user profile"})
			return
		}
		filter:=bson.D{{"email",email}}
		update := bson.D{{"$set", bson.D{{"first_name", user.First_name},{"last_name",user.Last_name}}}}
        defer cancel()
        _ , err := userCollection.UpdateOne(
			ctx,
			filter,
			update,
			
		)
		if err!=nil{
			log.Println(err)
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Some error occured"})

			return 
		}
		c.JSON(http.StatusOK,user)
		return
		
	}
}


func OnlineAt() gin.HandlerFunc{
	return func(c *gin.Context){
       email:= c.Params.ByName("email")
	   ctx,cancel:=context.WithTimeout(context.Background(),100*time.Second)
	   var online models.Online
	   defer cancel()
	   filter := bson.D{{"email", email}}
	   err := onlineCollection.FindOne(ctx, filter).Decode(&online)
	   if err!=nil{
		    log.Println(err)
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Some error occured"})
			return 
	   }
	   c.JSON(http.StatusOK,online)
	   return
	}
}

func GetMessages()gin.HandlerFunc{
	return func(c *gin.Context){
       peer1:=c.Params.ByName("email")
	   peer2:=c.GetString("email")
	   ctx,cancel:=context.WithTimeout(context.Background(),100*time.Second)
	   var messages []models.Message
	   filter := bson.D{
           {"$or",
            bson.A{
               bson.D{{"senderemail", peer1},{"recieveremail",peer2}},
               bson.D{{"senderemail", peer2},{"recieveremail",peer1}},
                },
            },
        }
		opts := options.Find().SetSort(bson.D{{"timestamp", 1}})
         defer cancel()
		cursor, err := messageCollection.Find(ctx, filter,opts)
		if err = cursor.All(ctx, &messages); err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Some error occured"})
			return 
		}
		log.Println(messages)
		c.JSON(http.StatusOK,messages)
		return
	}
}

func EditMessage() gin.HandlerFunc{
	return func(c *gin.Context){
		id:=c.Params.ByName("id")
		email:= c.GetString("email")
		var mes MessageStruct
		var message models.Message
		ctx,cancel:=context.WithTimeout(context.Background(),100*time.Second)
		if err := c.BindJSON(&mes);err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error":err.Error()})
			return
		}
		validationErr:= validate.Struct(mes)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest,gin.H{"error":validationErr.Error()})
			return
		}
		filter:= bson.D{{"id",id}}
		defer cancel()
		err := messageCollection.FindOne(ctx, filter).Decode(&message)
        if err != nil {
           if err == mongo.ErrNoDocuments {
            c.JSON(http.StatusBadRequest,gin.H{"error":"Message with this id does not exists"})
            return
            }
        log.Println(err)
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Some error occured"})
		return
    }
	if message.SenderEmail!=email{
		c.JSON(http.StatusBadRequest,gin.H{"error":"You cant edit others message"})
		return
	}
    update := bson.D{{"$set", bson.D{{"text", mes.Text},{"edited",true}}}}
    _, err = messageCollection.UpdateOne(ctx, filter, update)
     if err != nil {
	   log.Println(err)
	   c.JSON(http.StatusInternalServerError,gin.H{"error":"Some error occured cant able to update the message"})
	   return
     }
	 message.Text=mes.Text
	 message.Edited=true 
	 c.JSON(http.StatusOK,message)
	 return
	 
	}
}

func DeleteMessage() gin.HandlerFunc{
	return func(c *gin.Context){
		id:=c.Params.ByName("id")
		email:= c.GetString("email")
		
		var message models.Message
		ctx,cancel:=context.WithTimeout(context.Background(),100*time.Second)
		
		filter:= bson.D{{"id",id}}
		defer cancel()
		err := messageCollection.FindOne(ctx, filter).Decode(&message)
        if err != nil {
           if err == mongo.ErrNoDocuments {
            c.JSON(http.StatusBadRequest,gin.H{"error":"Message with this id does not exists"})
            return
            }
        log.Println(err)
		c.JSON(http.StatusInternalServerError,gin.H{"error":"Some error occured"})
		return
    }
	if message.SenderEmail!=email{
		c.JSON(http.StatusBadRequest,gin.H{"error":"You cant edit others message"})
		return
	}
  
 
	_, err = messageCollection.DeleteOne(ctx, filter)
     if err != nil {
	   log.Println(err)
	   c.JSON(http.StatusInternalServerError,gin.H{"error":"Some error occured cant able to update the message"})
	   return
     }
	
	 c.JSON(http.StatusOK,gin.H{"Success":"Message deleted"})
	 return
	}
}

func GetUser() gin.HandlerFunc{
	return func(c *gin.Context){
		email:= c.GetString("email")
		first_name:=c.GetString("first_name")
		c.JSON(http.StatusOK,gin.H{"status":"success","email":email,"first_name":first_name})
		return

	}
}