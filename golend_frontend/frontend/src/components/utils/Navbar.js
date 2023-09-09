import React, { useContext, useEffect, useState } from 'react'
import authContext from '../../context/auth/authContext'
import { Navigate } from 'react-router-dom'
import { Link, useLocation,useNavigate } from 'react-router-dom'
import apiContext from '../../context/api/apiContext'

import { SERVER_URL } from '../../constants'
import nftContext from '../../context/nft/nftContext'
const Navbar = () => {

  const [isAuthenticated,setIsAuthenticated]=useState(false)
  const {checkLoginStatus,login,setAlert}=useContext(authContext)
  const {setMessageHistory,setJsonMessage,setSendMessage,setLastMessage}=useContext(apiContext)
  const {account,web3Handler,setMapping}=useContext(nftContext)
  const [user,setUser]=useState(null)
  let location = useLocation();
  const navigate=useNavigate();
  let fetchData=async()=>{
    if(localStorage.getItem('token')){
      let token=localStorage.getItem('token')
      let authenticated=await checkLoginStatus(token)
      setIsAuthenticated(authenticated?true:false)
      if(authenticated){
        setUser(authenticated)
       
      }
      
    }
    else{
       setIsAuthenticated(false)

    }
  }
  const LogoutHandler=async()=>{
    if(localStorage.getItem('token')){
      localStorage.removeItem('token')
      return navigate("/login")
    }
  }
  useEffect(()=>{
  
      fetchData()
  },[])
  let connectHandler=async()=>{
    try{
      await web3Handler()
      if(account&&user){
      
        await setMapping(user.email,account)
      }
    }catch(e){
      setAlert({message:"Some error occured", type: 'danger'})
      console.log(e)
    }
  }
  return (
  
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
  <div className="container-fluid">
    <a className="navbar-brand" href="/">GoLend</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <Link className={`nav-link ${(location.pathname==='/login'||location.pathname==='/')&&'active'}`} aria-current="page" to={isAuthenticated?"/":"/login"}>{isAuthenticated?"Home":"Login"}</Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link ${(location.pathname==='/signup'||location.pathname==='/userProfile')&&'active'}`} to={isAuthenticated?"/userProfile":"/signup"}>{isAuthenticated?"userProfile":"SignUp"}</Link>
        </li>
        {isAuthenticated?<li className="nav-item">
        <li className="nav-item">
        <Link className={`nav-link ${(location.pathname==='/chats')&&'active'}`} aria-current="page" to="/chats">Chats</Link>
         </li>
         </li>:<></>}
      </ul>
      {isAuthenticated?account?<button type="button" class="btn btn-warning p-1">
        {account.slice(0,5)+'...'+account.slice(38,42)}
      </button>:<button type="button" class="btn btn-warning p-2" onClick={connectHandler}>Connect</button>:<></>}
    </div>
    {isAuthenticated?<button type='button' className="btn btn-danger m-1" onClick={LogoutHandler}>Logout</button>:<></>}
    
  </div>
</nav>
  
  )
}

export default Navbar
