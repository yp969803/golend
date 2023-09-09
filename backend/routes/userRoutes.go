package routes

import (
	controller "golend/backend/controllers"
	"github.com/gin-gonic/gin"
)
func UserRoutes(incomingRoutes *gin.Engine) {
    incomingRoutes.POST("/auth/signup", controller.SignUp())
    incomingRoutes.POST("/auth/login", controller.Login())
	incomingRoutes.GET("/auth/verifyemail/:verificationCode",controller.VerifyEmail())
	incomingRoutes.POST("/auth/forgotpassword",controller.ForgotPassword())
	incomingRoutes.PATCH("/auth/resetpassword/:resetToken",controller.ResetPassword())
}