package models
import(
	"time"
	
)

type Message struct {
	ID                string                   `json:"id"` 
	Text              string                   `json:"text"`
	SenderEmail       string                   `json:"sender_email"`
	RecieverEmail     string                   `json:"reciever_email"`
	Timestamp         time.Time                `json:"timestamp"`
	Edited            bool                     `json:"edited" default:"false"`

}