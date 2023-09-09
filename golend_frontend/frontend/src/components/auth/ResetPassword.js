import React, { useContext, useEffect, useState } from 'react'
import authContext from '../../context/auth/authContext'
import { useNavigate, useParams } from 'react-router-dom'

const ResetPassword = () => {
    const [password,setPassword]=useState("");
    const [confirmPassword,setConfirmPassword]=useState("");
    let {forgotPassword,setAlert,checkLoginStatus,resetPassword} =useContext(authContext)
    let navigate=useNavigate()
    const {resetCode} = useParams() 
    const SubmitHandler=async()=>{
        const response=await resetPassword(resetCode,password,confirmPassword);
        if (response.status==200){
           setAlert({message:"We have sent a email for reseting password"});
        }
        else{
            
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
      <h1 class="display-6 text-center my-2 p-2">Reset your password</h1>
      <div className="container p-5 my-3">

        <form>
        <div className="mb-3">
            <label for="exampleInputPassword1" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="exampleInputPassword1"
              onChange={(e) => {
                let value = e.target.value;
                setPassword(value.split(" ").join(""));
              }}
              value={password}
            />
            <p className="text-secondary p-3">
              Password must be atleast 6 characters long
            </p>
          </div>
          <div className="mb-3">
            <label for="exampleInputPassword1" className="form-label">
              Confirm Password
            </label>
            <input
              type="Password"
              className="form-control"
              id="exampleInputPassword"
              onChange={(e) => {
                let value = e.target.value;
                setConfirmPassword(value.split(" ").join(""));
              }}
              value={confirmPassword}
            />
            
          </div>

          <button
            type="button"
            className="btn btn-primary mx-2"
            disabled={password!=confirmPassword}
            onClick={SubmitHandler}
          >
            Submit
          </button>
          
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
