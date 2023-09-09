const express=require('express')
const app=express()
var bodyParser = require('body-parser')

var cors = require('cors')
app.use(cors())
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json())

const {createClient}=require('redis')
// const client = createClient({
//     url:'redis://localhost:6379',
//     legacyMode:true
// });
const client=createClient()
const connectRedis=async()=>{


client.on('error', err => console.log('Redis Client Error', err));
await client.connect()


}
connectRedis()


app.post('/set',async(req,res)=>{
    console.log(req.body)
    const {email,address}=req.body;
    // console.log(email)
    
   await client.set(email,address);
   await client.set(address,email)
    
    res.json('Mapping done')
    return
})
app.get('/getAddress/:email',async(req,res)=>{
    let email=req.params.email;
    console.log(email)
    let value=await client.get(email);
    console.log(value,"hello")
    if(value){
        console.log(value)
        res.json({status:'success',value:value})
        return

    }
    res.json({status:'fail',error:'No mapping exists'})
    return

})
app.get('/getEmail/:address',async(req,res)=>{
    let address=req.params.address;
    console.log(address)
    let value=await client.get(address);
    console.log(value)
    if(value){
        console.log(value,"helku")
        res.json({status:'success',value:value})
        return
    }
    res.json({status:'fail',error:'No mapping exists'})
    return
    
})

app.listen(3001,()=>{

    console.log('Server is running on port 3001')
})