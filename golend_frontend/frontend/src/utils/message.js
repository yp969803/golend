export const Deletemessage=(messages,setMessages,id)=>{
    let newMessages = messages.map(elem=>{
        if(elem.id==id){
            return
        }
        else{
            return elem
        }
    })
    setMessages(newMessages)

}
export const addMessage=(messages,setMessages,message)=>{
    setMessages(messages.concat(message))
}
export const EditMessage=(messages,setMessages,id,text)=>{
    const newMessages=messages.map((element)=>{
        if (element.id === id) {
              element.text= text
              
              return element;
            }
            return element;
      })
      setMessages(newMessages)  
}

export const messageExists=(messages,id)=>{
    messages.forEach(elem => {
        if(elem.id==id){
            return true
        }

    })
    return false;
}