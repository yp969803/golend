package routes

import(

	"github.com/gin-gonic/gin"
	middleware "golend/backend/middlewares"
	controller "golend/backend/controllers"
)

func PrivateRoutes(incomingRoutes *gin.Engine){


    protectedRoutes := incomingRoutes.Group("/api")

	protectedRoutes.Use(middleware.Authentication())


    protectedRoutes.GET("/user",controller.GetUser())
	protectedRoutes.GET("/profile/:email",controller.GetProfile())
	protectedRoutes.GET("/allProfile",controller.GetAllProfiles())
	protectedRoutes.POST("/updateProfile",controller.UpdateProfile())
	protectedRoutes.GET("/onlineAt/:email",controller.OnlineAt())

	
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

   
    protectedRoutes.GET("/message/:email",controller.GetMessages())
	protectedRoutes.PUT("/editMessage/:id",controller.EditMessage())
	protectedRoutes.DELETE("/deleteMessage/:id",controller.DeleteMessage())

   
}