package controllers

import(
	"context"
	"fmt"
	"log"
	"net/http"
	
	"os"
	"github.com/joho/godotenv"
	"time"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"golend/backend/database"
	helper "golend/backend/helpers"

    "golend/backend/models"
    "go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
    "golang.org/x/crypto/bcrypt"
	
	"github.com/thanhpk/randstr"
    "golend/backend/utils"


)
var userCollection *mongo.Collection = database.OpenCollection(database.Client, "user")
var validate = validator.New()
func HashPassword(password string) string  {
	bytes,err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil{
		log.Panic(err)
	}
	return string(bytes)
}

func VerifyPassword(userPassword string, providedPassword string)(bool,string)  {

	err := bcrypt.CompareHashAndPassword([]byte(providedPassword), []byte(userPassword))
    check := true
	msg:=""
	if err!=nil {
		msg=fmt.Sprintf("Invalid user credentials")
		check=false
	}
	return check,msg
}
func SignUp() gin.HandlerFunc{
	return func(c *gin.Context){
		var ctx, cancel= context.WithTimeout(context.Background(),100*time.Second)
		var user models.User 
		if err := c.BindJSON(&user);err != nil{
			c.JSON(http.StatusBadRequest, gin.H{"error":err.Error()})
			return
		}
		validationErr:= validate.Struct(user)
		if validationErr != nil {
			c.JSON(http.StatusBadRequest,gin.H{"error":validationErr.Error()})
			return
		}
		defer cancel()
		count,err := userCollection.CountDocuments(ctx, bson.M{"email":user.Email})
		
		if err!=nil {
			log.Panic(err)
			c.JSON(http.StatusInternalServerError,gin.H{"error":"Error occured while checking for the email"})
			return

		}
		err = godotenv.Load(".env")
		configUrl:= os.Getenv("CLIENT_ORIGIN")
	    if err!= nil{
		log.Fatal("Error loading .env file")

	    }
		password:=HashPassword(*user.Password)
		user.Password=&password
		count,err = userCollection.CountDocuments(ctx,bson.M{"phone":user.Phone})
		
		if err != nil {
            log.Panic(err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "error occured while checking for the phone number"})
            return
        }
		if count > 0 {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "this email or phone number already exists"})
            return
        }
	
        code := randstr.String(20)
        verification_code := code
		emailData := utils.EmailData{
			URL:       configUrl + "/verifyemail/" + code,
			FirstName: *user.First_name,
			Subject:   verification_code,
		}
		user.VerificationCode=verification_code
		user.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
        user.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
        user.ID = primitive.NewObjectID()
        user.User_id = user.ID.Hex()
        token, refreshToken, _ := helper.GenerateAllTokens(*user.Email, *user.First_name, *user.Last_name, user.User_id)
        user.Token = &token
        user.Refresh_token = &refreshToken
		_, insertErr := userCollection.InsertOne(ctx, user)
        utils.SendEmail(&user, &emailData,"verificationCode.html")
         

		if insertErr != nil {
            msg := fmt.Sprintf("User item was not created")
            c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
            return
        }
       

		msg:=fmt.Sprintf("We sent an email with a verification code to %s", *user.Email)
		c.JSON(http.StatusOK, gin.H{"msg":msg})
        
	
	}

}

func VerifyEmail() gin.HandlerFunc {
	return func(c *gin.Context){
		var ctx,_=context.WithTimeout(context.Background(),100*time.Second)
		code := c.Params.ByName("verificationCode")
        
		verification_code:=code
		var user models.User 
		err:= userCollection.FindOne(ctx,bson.M{"verificationcode":verification_code}).Decode(&user)
		
		if err!=nil{
            c.JSON(http.StatusBadRequest, gin.H{"status":"fail","message": "Invalid verification code or user doesn't exists"})
			return
		}
		if user.Verified {
			c.JSON(http.StatusConflict, gin.H{"status": "fail", "message": "User already verified"})
			return

		}
		user.VerificationCode = ""
		user.Verified=true
        update := bson.D{{"$set", bson.D{{"verificationcode", ""},{"verified",true}}}}
		
		
        filter := bson.D{{"verificationcode", verification_code}}
		_, err = userCollection.UpdateOne(
			ctx,
			filter,
			update,
			
		)
		
	
		if err != nil {
			log.Panic(err)
			return
		}
		c.JSON(http.StatusOK,gin.H{"status": "success", "message": "Email verified successfully"})
        
	}
}

func Login() gin.HandlerFunc {
	return func(c *gin.Context){
		var ctx,cancel=context.WithTimeout(context.Background(),100*time.Second)
		var user models.User 
		var foundUser models.User
		if err:= c.BindJSON(&user); err!=nil{
			c.JSON(http.StatusBadRequest,gin.H{"error":err.Error()})
			return
		}
		defer cancel()
		err:= userCollection.FindOne(ctx,bson.M{"email":user.Email}).Decode(&foundUser)
		
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "login or passowrd is incorrect"})
            return
        }
		passwordIsValid, msg := VerifyPassword(*user.Password, *foundUser.Password)
       
        if passwordIsValid != true {
            c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
            return
        }
		if !foundUser.Verified{
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email not verified"})
            return
		} 
        token, refreshToken, _ := helper.GenerateAllTokens(*foundUser.Email, *foundUser.First_name, *foundUser.Last_name, foundUser.User_id)

        helper.UpdateAllTokens(token, refreshToken, foundUser.User_id)
        

        c.JSON(http.StatusOK, foundUser)
	}
}

func ForgotPassword() gin.HandlerFunc  {
	return func(c *gin.Context){
		var ctx,cancel=context.WithTimeout(context.Background(),100*time.Second)
		var user models.User
        err := godotenv.Load(".env")
		configUrl:= os.Getenv("CLIENT_ORIGIN")
	    if err!= nil{
		log.Fatal("Error loading .env file")

	    }
		var userCredential *models.ForgotPasswordInput
		if err := c.ShouldBindJSON(&userCredential); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": err.Error()})
			return
		}
	
		message := "You will receive a reset email if user with that email exist"
		defer cancel()
		err= userCollection.FindOne(ctx,bson.M{"email":userCredential.Email}).Decode(&user)
		
		if err!=nil{
			
			c.JSON(http.StatusInternalServerError, gin.H{"error": "No user with this email"})
            return
		}
		if !user.Verified {
			c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Account not verified"})
			return
		}
		
		resetToken := randstr.String(20)
		update := bson.D{{"$set", bson.D{{"password_reset_token", resetToken}, {"password_reset_at",time.Now().Add(time.Minute * 15)}}}}

		
        filter := bson.D{{"email", user.Email}}
		result, err := userCollection.UpdateOne(
			ctx,
			filter,
			update,
			
		)
		if result.MatchedCount == 0 {
			c.JSON(http.StatusBadGateway, gin.H{"status": "success", "message": "There was an error sending email"})
			return
		}
        if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"status": "success", "message": err.Error()})
			return
		}
		emailData := utils.EmailData{
			URL:       configUrl + "/resetpassword/" + resetToken,
			FirstName: *user.First_name,
			Subject:   "Your password reset token (valid for 10min)",
		}
		utils.SendEmail(&user, &emailData,"resetPassword.html")
	
	    c.JSON(http.StatusOK, gin.H{"status": "success", "message": message})


	}
	
}

func ResetPassword() gin.HandlerFunc  {
	return func(c *gin.Context){
		var ctx,cancel=context.WithTimeout(context.Background(),100*time.Second)
		resetToken := c.Params.ByName("resetToken")
		var userCredential *models.ResetPasswordInput
		if err := c.ShouldBindJSON(&userCredential); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": err.Error()})
			return
		}
		
		if userCredential.Password != userCredential.PasswordConfirm {
			c.JSON(http.StatusBadRequest, gin.H{"status": "fail", "message": "Passwords do not match"})
			return
		}
		hashedPassword:= HashPassword(userCredential.Password)
		
		filter:= bson.D{{"password_reset_token",resetToken}}
		update := bson.D{{"$set", bson.D{{"password", hashedPassword}}}, {"$unset", bson.D{{"password_reset_token",  ""}, {"password_reset_at",""}}}}
        defer cancel()

        result , err := userCollection.UpdateOne(
			ctx,
			filter,
			update,
			
		)
		
		if result.MatchedCount == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"status": "success", "message": "Token is invalid or has expired"})
			return
		}

		if err != nil {
			log.Panic(err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Password data updated successfully"})

	

	}

	
}

