import React, { useContext, useEffect, useState } from "react";
import authContext from "../context/auth/authContext";
import apiContext from "../context/api/apiContext";
import { useNavigate } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { SOCKET_URL } from "../constants";
import { Routes, Route } from "react-router-dom";
import Chats from "./chat/Chats";
import PrivateChat from "./chat/PrivateChat";
import nftContext from "../context/nft/nftContext";
import NftCard from "./nft/NftCard";
const Home = () => {
  const [user, setUser] = useState(null);
  let { checkLoginStatus } = useContext(authContext);
  const [messageHistory, setMessageHistory] = useState([]);
  const [nftList,setNftList]=useState([])

  let {listed,unlisted,setListed,setUnlisted,account,setAccount,setMapping} = useContext(nftContext);
  const navigate = useNavigate();
  async function fetchData() {
    let token = localStorage.getItem("token");
    if (token) {
      let bool = await checkLoginStatus(token);
      if(account){
        let response=await setMapping(bool.email,account)
      }
      setUser(bool);
      console.log(bool);

      if (!bool) {
        return navigate("/login");
      }
    } else {
      return navigate("/login");
    }
  }
  let socUrl = user
    ? `${SOCKET_URL}${user.email}/${user.first_name}`
    : `${SOCKET_URL}`;
  const { sendMessage, lastMessage, sendJsonMessage, readyState } =
    useWebSocket(socUrl, {
      onOpen: () => console.log("opened"),
      shouldReconnect: (closeEvent) => true,
      reconnectAttempts: 50,
      reconnectInterval: 3000,
    });

  useEffect(() => {
  
    fetchData();

    if (lastMessage !== null) {
      console.log(lastMessage);
      setMessageHistory((prev) => prev.concat(lastMessage.data));
    }
   
    if(listed){
      console.log(listed)
      listed.map((e)=>{
        let tid=(e.args.tokenId).toString()
        let nft={tokenId:parseInt(tid) ,time:e.args.time}
        setNftList(nftList.concat(nft))

      })
    }
    if(unlisted){
      unlisted.map((e)=>{
        var withoutToken = nftList.filter((el)=>{
          let tid=(e.args.tokenId).toString()
          let intid=parseInt(tid)
          return intid != el.tokenId
        });
        setNftList(withoutToken)
      })
    }
   
    
    

  }, [lastMessage, setMessageHistory, useWebSocket,setListed,setNftList,listed,unlisted,setAccount,account]);

  return (
    <div>
      <blockquote class="blockquote text-center">
        <p class="mb-0">
          GoLend | A world of NFT's
        </p>
        <footer class="blockquote-footer m-2">
          Buy Sell List Lend <cite title="Source Title">NFT's</cite>
        </footer>
      </blockquote>
      <div className="container text-center">
        <div className="row">
          {
            nftList.map(elem=>{
              return <NftCard tokenId={elem.tokenId} time={elem.time} key={Math.random()}/>
            })
          }
        </div>

      </div>
    </div>
  );
};

export default Home;
