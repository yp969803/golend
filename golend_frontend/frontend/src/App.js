
import { Routes,Route, useNavigate } from "react-router-dom";
import Navbar from "./components/utils/Navbar";
import Login from "./components/auth/Login";
import Alert from "./components/utils/Alert";
import { useContext, useEffect, useState } from "react";
import authContext from "./context/auth/authContext";
import SignUp from "./components/auth/SignUp";
import VerifyEmail from "./components/auth/VerifyEmail";
import ForgetPassword from "./components/auth/ForgetPassword";
import ResetPassword from "./components/auth/ResetPassword";
import Home from "./components/Home";
import UserProfile from "./components/user/UserProfile";
import Chats from "./components/chat/Chats";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import apiContext from "./context/api/apiContext";
import { SOCKET_URL } from "./constants";
import PrivateChat from "./components/chat/PrivateChat";
import AnotherUserProfile from "./components/user/AnotherUserProfile";

function App() {
  const [user,setUser]=useState(null)
  let {checkLoginStatus} =useContext(authContext)
  const [messageHistory, setMessageHistory] = useState([]);

  let {}= useContext(apiContext)
  const navigate=useNavigate();
 async function fetchData(){
       let token =localStorage.getItem("token");  
        if (token) {
          let bool = await checkLoginStatus(token);
          setUser(bool)
          console.log(bool)
        
          if (!bool) {
            return navigate("/login");
          }
        }
        else{
            return navigate("/login")
        }
        
     }
     let socUrl=user?`${SOCKET_URL}${user.email}/${user.first_name}`:`${SOCKET_URL}`
     const { sendMessage, lastMessage, sendJsonMessage,readyState } = useWebSocket(socUrl,{
      onOpen: () => console.log('opened'),
      shouldReconnect: (closeEvent) => true,
      reconnectAttempts: 50,
      reconnectInterval: 3000,
     });
     useEffect(()=>{
      console.log('Hello')
      fetchData()

      if (lastMessage !== null) {
        
        let data=JSON.parse(lastMessage.data)
        console.log(data)
        setMessageHistory((prev) => prev.concat(data));
      }
     },[lastMessage,setMessageHistory,useWebSocket])
  let {alert}=useContext(authContext)
  return (
    <div >
      <Navbar/>
      <Alert alert={alert}/>
      <Routes>
        <Route exact path ="/"  element={<Home/>}/>
        <Route exact path="/login" element={<Login/>}/>
        <Route exact path="/signup" element={<SignUp/>}/>
        <Route exact path="/verifyemail/:verificationCode" element={<VerifyEmail/>} />
        <Route exact path="/forgetPassword" element={<ForgetPassword/>}/>
        <Route exact path="/resetpassword/:resetCode" element={<ResetPassword/>} />
        <Route exact path="/userProfile" element={<UserProfile/>}/>
        <Route exact path="/chats" element={<Chats/>}/>
        <Route exact path="/chats" element={<Chats messageHistory={messageHistory} setMessageHistory={setMessageHistory}/>}/>
        <Route exact path="/privateChat/:email" element={<PrivateChat messageHistory={messageHistory} sendJsonMessage={sendJsonMessage} setMessageHistory={setMessageHistory}/>}/>
        <Route exact path="/anotherProfile/:email" element={<AnotherUserProfile/>} />
      </Routes>
    </div>
  );
}

export default App;
