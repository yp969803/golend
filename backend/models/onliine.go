package models


import(
	"time"
)

type Online struct{
	Useremail                 string             `json:"email"`
	Timestamp                 time.Time           `json:"timestamp"`
	
}