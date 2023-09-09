import React, { useContext, useEffect, useState } from "react";
import apiContext from "../../context/api/apiContext";
import authContext from "../../context/auth/authContext";
import { useNavigate } from "react-router-dom";
import { AVATARAPI, AVATARURL } from "../../constants";
import { Link } from "react-router-dom";
const Chats = ({messageHistory,setMessageHistory}) => {
  let { allProfiles, onlineAt } = useContext(apiContext);
  const [Token,setToken]=useState(null)
  const [user, setUser] = useState(null);
  const [allUser, setAllUser] = useState(null);
  let { checkLoginStatus } = useContext(authContext);
  const navigate = useNavigate();
 
  const [onlineUsers,setOnlineUsers]=useState([])
  let AllProfile = async (token) => {
    let response = await allProfiles(token);
    if (response && response.status == 200) {
      setAllUser(response.data);
    }
  };

  async function fetchData() {
    let token = localStorage.getItem("token");
    if (token) {
      let bool = await checkLoginStatus(token);
      await AllProfile(token);
      setUser(bool);
      setToken(token)

      if (!bool) {
        return navigate("/login");
      }
    } else {
      return navigate("/login");
    }
  }
 
  useEffect(() => {
    fetchData();
    console.log('yo')
    if(messageHistory){
      messageHistory.map(mes=>{
        if(mes.EventName=='join'&&mes.EventName=='disconnect'){
          let data=mes.EventName.users
         
          setOnlineUsers(data)
          
        }
      })
    }
    
  }, [setMessageHistory,messageHistory]);
  return (
    <div>
      <p className="lead text-center ">Realtime Chat with Golend</p>
      <div className="container p-2">
        <div className="grid p-2 ">
          {allUser ? (
            allUser.map((user) => {
              
              return (
                <div className="g-col-6 p-2 m-2 border border-primary rounded" key={Math.random()}>
                  <div className="d-flex flex-row">
                    <img
                      src={`${AVATARURL}${user.email}.png?apikey=${AVATARAPI}`}
                      alt="avatar"
                      className="rounded-circle d-flex align-self-center me-3 shadow-1-strong"
                      width="60"
                    />
                    <div className="pt-1">
                      <p className="fw-bold mb-0">{user.first_name}</p>
                      <p className="small text-muted">
                        <Link to={`/privateChat/${user.email}`}>{user.email}</Link>
                      </p>
                      <p className="text-center success"> {onlineUsers.includes(user.email)?"Online":""}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
