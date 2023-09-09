import React from 'react'
import { AVATARAPI,AVATARURL } from '../../constants'
const Chat2 = ({message}) => {
  return (
    <div>
         <div className="d-flex flex-row justify-content-end mb-4 pt-1">
              <div>
                <p className="small p-2 me-3 mb-1 text-white rounded-3 bg-primary">{message.text}</p>
               
                <p className="small me-3 mb-3 rounded-3 text-muted d-flex justify-content-end">{(new Date(message.timestamp)).toString()}</p>
              </div>
              <img src={`${AVATARURL}${message.sender_email}.png?apikey=${AVATARAPI}`}
                alt="avatar 1" style={{"width": "45px", "height": "100%"}}/>
            </div>

      
    </div>
  )
}

export default Chat2
