import React, { useContext, useEffect, useState } from "react";
import authContext from "../../context/auth/authContext";
import { Link, useNavigate } from "react-router-dom";

import Alert from "../utils/Alert";
import axios from "axios";

const Login = () => {
  let navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  let { checkLoginStatus,login,setAlert} = useContext(authContext);
  async function fetchData(){
    let token = localStorage.getItem("token");
    if (token) {
      let bool = await checkLoginStatus(token);
      if (bool) {
        return navigate("/");
      }
    }
  }
  useEffect(() => {
    fetchData()
   
  }, []);
  const LoginHandler = async (email,password) => {
   
    
    let response = await login(email,password);
    
    
     
    if (response.status==200) {
      let data=response.data
      localStorage.setItem("token",data.token)
      setAlert({message:"Login Successful",type:"success"})
      
      return navigate("/");
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
  };
  return (
    <div>
      <h3 className="text-center ">
        GoLend
        <small className="text-body-secondary"> Sell Buy Lend NFTs</small>
      </h3>

      <div className="container p-5 my-3">
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
          <div className="mb-3">
            <label for="exampleInputPassword1" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="exampleInputPassword1"
              required
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
          <button
            type="button"
            className="btn btn-primary mx-2"
            disabled={password.length < 6}
            onClick={(e)=>{
              e.preventDefault()
              LoginHandler(email,password)}}
          >
            Submit
          </button>
          <span type="button" className="text-danger mx-2">
            <Link to="/forgetPassword">ForgetPassword</Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
