import React, { useContext, useEffect, useState } from 'react'
import authContext from '../../context/auth/authContext'
import { useNavigate } from 'react-router-dom'
import Spinner from '../utils/Spinner'

const ForgetPassword = () => {
    const [email,setEmail]=useState("")
    let {forgotPassword,setAlert,checkLoginStatus} =useContext(authContext)
    let navigate=useNavigate()
    let {loading,setLoading}=useState(false)
   
    const SubmitHandler=async()=>{
        setLoading(true)
        const response=await forgotPassword(email);
        if (response.status==200){
            setLoading(false)
           setAlert({message:"We have sent a email for reseting password",type:"success"});

        }
        else{
            setLoading(false)
            if(response.data.error){
              setAlert({message:response.data.error,type:"danger"})
             
            }
            else if(response.data.message){
              setAlert({message:response.data.message,type:"danger"})
             
            }
            else{
              setAlert({message:"Some error occured",type:"danger"})
             
            }
          }
    }
  return (
    <div>
      <h3 className="text-center ">
        GoLend
        <small className="text-body-secondary"> Sell Buy Lend NFTs</small>
      </h3>
      <h1 class="display-6 text-center my-2 p-2">Submit your email Address</h1>
      {loading?<Spinner message={"Processing your request"}/>:<div className="container p-5 my-3">

<form>
  <div className="mb-3">
    <label for="exampleInputEmail1" className="form-label">
      Email address
    </label>
    <input
      required
      type="email"
      className="form-control"
      id="exampleInputEmail1"
      aria-describedby="emailHelp"
      onChange={(e) => {
        setEmail(e.target.value);
      }}
    />
    <div id="emailHelp" className="form-text">
      We'll never share your email with anyone else.
    </div>
  </div>

  <button
    type="button"
    className="btn btn-primary mx-2"
    disabled={email.length<4}
    onClick={SubmitHandler}
  >
    Submit
  </button>
  
</form>
</div>}
    </div>
  )
}

export default ForgetPassword
