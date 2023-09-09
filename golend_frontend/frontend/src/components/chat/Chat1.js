import React, { useContext, useEffect, useState } from "react";
import { AVATARAPI,AVATARURL } from "../../constants";
import apiContext from "../../context/api/apiContext";
import { EditMessage,Deletemessage } from "../../utils/message";
const Chat1 = ({message,messages,setMessages,token}) => {
    let {editMessage,deleteMessage}=useContext(apiContext)
    let [text,setText]=useState(message.text);


    let editHandler=async()=>{
       if(token&&text!=message.text){
        let response=await editMessage(text,message.id,token)
        if (response&&response.status==200){
            EditMessage(messages,setMessages,message.id,text)

        }
       }
    }
    let deleteHandler=async()=>{
         if(token){
            let response=await deleteMessage(message.id,token);
            if(response&&response.status==200){
                Deletemessage(messages,setMessages,message.id)
            }
         }
    }
   
  return (
    <div>
      <div className="d-flex flex-row justify-content-start">
        <img
          src={`${AVATARURL}${message.sender_email}.png?apikey=${AVATARAPI}`}
          alt="avatar 1"
          style={{ width: "45px", height: "100%" }}
        />
        <div>
          <p
            className="small p-2 ms-3 mb-1 rounded-3"
            style={{ "background-color": "#f5f6f7" }}
          >
            {message.text} <span>{message.edited?"Edited":""}</span>
            
          </p>
          <i className="fa-solid fa-pen-to-square btn" data-bs-toggle="modal" data-bs-target="#exampleModal" ></i>
          <i className="fa-solid fa-trash btn" onClick={deleteHandler}></i>
          <p className="small ms-3 mb-3 rounded-3 text-muted">{(new Date(message.timestamp)).toString()}</p>
        </div>
      </div>
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="exampleModalLabel">Edit Message</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">
      <input type="text" className="form-control" placeholder="Message" aria-label="Username" aria-describedby="basic-addon1" value={text} onChange={(e)=>{setText(e.target.value)}}/>

      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" className="btn btn-primary" onClick={editHandler}>Save changes</button>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default Chat1;
