import React, { useContext, useEffect, useState } from "react";
import authContext from "../../context/auth/authContext";
import {useNavigate } from "react-router-dom";

import Alert from "../utils/Alert";
import Spinner from "../utils/Spinner";


const SignUp = () => {
  let navigate = useNavigate();
  const [loading,setLoading]=useState(false) 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first,setFirst]=useState("")
  const [Last,setLast]=useState("")
  const [phone,setPhone]=useState("")
  let { checkLoginStatus, login,setAlert ,signup} = useContext(authContext);
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
  const SingUpHandler = async () => {
    setLoading(true);
    let response = await signup(first, Last,password,email,phone);
    
    
    if (response.status == 200) {
        setLoading(false)
      setAlert({message:"We have sent email to you for email verification",type:"success"})
      return navigate("/login");
    }
    else{
        setLoading(false);
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

     {loading?<Spinner message={"Loading"}/>: <div className="container p-5 my-3">
        <form>
        <div className="mb-3">
            <label for="exampleInputEmail1" className="form-label">
              First Name
            </label>
            <input
              type="text"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              required
              onChange={(e) => {
                setFirst(e.target.value);
              }}
            />
           
          </div>
          <div className="mb-3">
            <label for="exampleInputEmail1" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              required
              onChange={(e) => {
                setLast(e.target.value);
              }}
            />
           
          </div>
          <div className="mb-3">
            <label for="exampleInputEmail1" className="form-label">
              Phone
            </label>
            <input
              type="text"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              required
              onChange={(e) => {
                setPhone(e.target.value);
              }}
            />
           
          </div>
          <div className="mb-3">
            <label for="exampleInputEmail1" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className="form-control"
              id="exampleInputEmail1"
              aria-describedby="emailHelp"
              required
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
            onClick={SingUpHandler}
                
          >
            Submit
          </button>
          
        </form>
      </div>}
    </div>
  );
};

export default SignUp;
