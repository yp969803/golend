package main

import(
	"os"
	middleware "golend/backend/middlewares"
	routes "golend/backend/routes"
	"log"
	"net/http"
	"github.com/gin-gonic/gin"
	 "golend/backend/helpers"
	 "github.com/gorilla/websocket"
	 "github.com/gin-contrib/cors"

    _ "github.com/heroku/x/hmetrics/onload"

)


func main()  {
	port := os.Getenv("PORT")
	if port == "" {
        port = "8000"
    }
	corsConfig := cors.Config {
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE","PATCH"},
		AllowHeaders: []string{"Origin", "Content-Type","Authorization","accept","Cache-Control","X-Requested-With","X-CSRF-Token","Accept-Encoding","Content-Length","token"},
		AllowCredentials: true,
	}
    router:=gin.New()
	router.Use(cors.New(corsConfig))
	router.Use(gin.Logger())
	hub:= helper.NewHub()
    go hub.Run()
	protectedRoutes := router.Group("/chat")
	protectedRoutes.Use(middleware.Authentication())
	router.GET("/ws/:email/:first_name",func(c *gin.Context){
		email := c.Params.ByName("email")
        first_name:= c.Params.ByName("first_name")
		log.Println("email:",email)
		log.Println("name:",first_name)
		var upgrader=websocket.Upgrader{
			ReadBufferSize: 1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		}
        connection, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log. Print("upgrade:", err)
			return
		   }
		
		helper.CreateNewSocketUser(hub, connection, email,first_name)


	})

	routes.UserRoutes(router)
    routes.PrivateRoutes(router)
	router.Run(":" + port)
}