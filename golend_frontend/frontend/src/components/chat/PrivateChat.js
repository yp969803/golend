import React, { useContext,useEffect,useState } from 'react'
import apiContext from '../../context/api/apiContext'
import authContext from '../../context/auth/authContext'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Chat1 from './Chat1'
import Chat2 from './Chat2'
import { AVATARAPI,AVATARURL } from '../../constants'
import Randomstring from 'randomstring'

const PrivateChat = ({messageHistory,setMessageHistory,sendJsonMessage}) => {
    let {getProfile,getAllMessages}=useContext(apiContext)
    let {checkLoginStatus}=useContext(authContext)
    let [user,setUser]=useState(null);
    let [anotherUser,setAnotherUser]=useState(null);
    let [messages,setAllMessages]=useState([]);
    
    let [text,setText]=useState(messages.text)
    let [Token,setToken]=useState(null)
    const navigate = useNavigate();
    let {email}=useParams()
    let getprofile=async(token)=>{
      let response=await getProfile(email,token)
      if(response&&response.status==200){
        setAnotherUser(response.data)
      }
    }
    let getAllmessages=async(token)=>{
        let response=await getAllMessages(email,token)
        if(response&&response.status==200){
         
            if(response.data){

             setAllMessages(response.data)
            }else{
              setAllMessages([])
            }
        }
    }
    async function fetchData() {
        let token = localStorage.getItem("token");
        if (token) {
          let bool = await checkLoginStatus(token);
          
          await getprofile(token);
          await getAllmessages(token)
          setUser(bool)
          setToken(token)
    
          if (!bool) {
            return navigate("/login");
          }
        } else {
          return navigate("/login");
        }
      }
    useEffect(()=>{
        fetchData()
        messageHistory.map(mes=>{
            if(mes.EventName=="message response" && (mes.EventPayload).sender_email==email){
                let data=mes.EventPayload
                let message={id:data.id, sender_email:data.sender_email, timestamp: Date.now(), reciever_email: data.email, text:data.message}
                setAllMessages(messages.concat(message))
            }
        })
    },[setMessageHistory,messageHistory])

    let SendHandler=async()=>{
     
      if(text.trim()!=""&&user&&anotherUser){
        let id=Randomstring.generate(7)
        
         let payload={id:id,sender_email:user.email,email:anotherUser.email, message:text,username:user.first_name}
         sendJsonMessage({
          EventName:"message",
          EventPayload: payload
         })
         

         let mes={id:id,sender_email:user.email, reciever_email:anotherUser.email, text:text, timestamp: Date.now()}
         messages?setAllMessages(messages.concat(mes)):console.log("")
       
      }
      setText("")
    }

  return (
    <div>
      <section style={{"background-color": "#eee"}}>
  <div className="container py-5">

    <div className="row d-flex justify-content-center">
      <div className="col-md-10 col-lg-8 col-xl-6">

        <div className="card" id="chat2">
          <div className="card-header d-flex justify-content-between align-items-center p-3">
          <img src={user?`${AVATARURL}${anotherUser.email}.png?apikey=${AVATARAPI}`:`${AVATARURL}${"hello"}.png?apikey=${AVATARAPI}`}
              alt="avatar 3" style={{"width": "40px", "height": "100%"}}/>
              <p>{anotherUser?anotherUser.first_name:""}</p>
              <Link to={`/anotherProfile/${anotherUser?anotherUser.email:""}`}> {anotherUser?anotherUser.email:""}</Link>
          </div>
          <div className="card-body overflow-auto" data-mdb-perfect-scrollbar="true" style={{"position": "relative", "height": "400px"}}>

          {
          
            messages.length>0&&user?messages.map((mes)=>{
             
              if(mes.sender_email==user.email){
               return  <Chat1 key={Math.random()} message={mes} token={Token} messages={messages} setMessages={setAllMessages}/>
              }
              
              else if(mes.sender_email==anotherUser.email){
                
                return <Chat2 key={Math.random()} message={mes}/>
              }
            }):<></>
          }
          </div>
          <div className="card-footer text-muted d-flex justify-content-start align-items-center p-3">
            <img src={user?`${AVATARURL}${user.email}.png?apikey=${AVATARAPI}`:`${AVATARURL}${"hello"}.png?apikey=${AVATARAPI}`}
              alt="avatar 3" style={{"width": "40px", "height": "100%"}}/>
            <input type="text" className="form-control form-control-lg" id="exampleFormControlInput1"
              placeholder="Type message" value={text} onChange={(e)=>{setText(e.target.value)}}/>
            
            <a className="ms-3" href="#!"><i className="fas fa-paper-plane" onClick={SendHandler}></i></a>
          </div>
        </div>

      </div>
    </div>

  </div>
</section>
    </div>
  )
}

export default PrivateChat
