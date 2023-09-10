
# GoLend | A World of NFT's
Golend is a NFT marketplace where you can mint-list, burn-unlist, sell, buy and Lend(as a collateral) Nft's.






## Tech Stack



**backend:** Go, gin framework

**Frontend**: React

**Database**: Mongodb

**Caching**: Redis and Node

**Contract-Development**: Hardhat

**Contract unit test**: Chai

**Test-net**: sapphire testnet

**Decentralised Storage Protocol**: IPFS, gateway- Pinata

**Token**: ERC-721 (oppenzepplin)

**Protocols**: Http, WebSockets, IPFS

**Languages**: Solidity Javadscript GoLang





## Features

- Login Signup Logout
- Email Verification
- Password Reset
- Realtime Chat
- Profile Update 
- See others Profile
- Mint and List Nft at Golend
- List Nft For Sale
- Update Selling Price
- Buy Nft 
- Lend Nft 
- Choose the Price, rate and Time Interval
- Edit price, rate and timeinterval
- Take the Lending Offer
- Money Repayment(inclusive of Rate) by lender in timeinterval
- Nft transfer if unable to payback money
- Burn and unlist Nft




## Run Locally

Prerequisite

- Go
- Nodejs and npm
- Mongodb 
- Reddis
- Metamask chrome extension
- Sapphire testnet account and faucet



```bash
# Clone the repository in $GOROOT/src directory

# Start the mongodb and redis server server 

# cd into the cloned repository 

# cd into backend folder 

# create the .env file using .env.example

# you can get get the SMTP username and password from https://mailtrap.io/ by creating account and setting up a test project all the email will arrive here. run

go mod init

go mod tidy

go run main.go

# cd into golend_frontend/frontend folder and run 

npm install

# cd into golend/node_redis and run 

npm install 

node run server.js

# you can access the application from http://localhost:3000

  ```
    
## WorkFlow

- SignUp with credentials, A verification email is send to your email, Verify the email.
- Login with veified email and Password
- Click on forget password if you forget or want to reset password, a password reset email will be send, Submit the new password 
- After login you will arrive to homepage
- Connect to your decentralized wallet
- At home page you will see all listed, listed for sale, listed for lend NFT's
- You can chat with lister and see his profile(his nft's also)
- You can buy nft listed for sale nft and take the offer of nft listed for lend
- By going to /chats page you can chat with any user registered with golend
- At /userProfile you can find your details and update the details 
- At this page you can see all your listed Nft 
- Clicking on Mint and List nft button you will able to mint and list nft to golend
- You have to choose the name, description and image of nft 
- You can list the nft for sale 
- You have to choose the selling price of the nft 
- If someone buys the nft the ownership of the nft is shifted to the buyer
- You can list the nft for lend, you have to choose the lending price, lending rate and the time interval for lend 
- You can edit the lending details before the lending
- Chat feature is there so the peers can settle at specific details 
- If someone finds the deal profitable he can take the offer by paying the price 
- The ownership of the nft is shifted to the smart contract
- The lender has to pay the price with  the rate fees till the lending interval to get back the ownership of nft 

- If the lender is unable to pay the amount till the lending time, the money payer can ask for the ownership of nft and the ownership is shifted from contract to money payer and all the till then payed by the lender is refunded back 





