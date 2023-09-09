import React, { useState } from "react";
import authContext from "./authContext";
import axios from "axios";
import { SERVER_URL } from "../../constants";

const AuthState = (props) => {
  const [user, setUser] = useState("");
  const [alert, setAlert] = useState(null);
  const login = async (email, password) => {
    try {
      
      const response = await axios.post(SERVER_URL + "/auth/login", {
        email: email,
        password: password,
      });
      
      return  response
    } catch (e) {
      console.log(e);
      if (e.response) {
        return e.response;
      } else {
        return { data: { error: "Some error occured" } };
      }
    }
  };

  const signup = async (first_name, last_name, Password, email, phone) => {
    try {
      const response = await axios.post(SERVER_URL + "/auth/signup", {
        first_name: first_name,
        last_name: last_name,
        Password: Password,
        email: email,
        phone: phone,
      });
      return response;
    } catch (e) {
      console.log(e);
      if (e.response) {
        return e.response;
      } else {
        return { data: { error: "Some error occured" } };
      }
    }
  };

  const verifyEmail = async (verificationCode) => {
    try {
      const response = await axios.get(
        SERVER_URL + "/auth/verifyemail/" + verificationCode
      );
      return response;
    } catch (e) {
      console.log(e);
      if (e.response) {
        return e.response;
      } else {
        return { data: { error: "Some error occured" } };
      }
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(SERVER_URL + "/auth/forgotpassword", {
        email: email,
      });
      return response;
    } catch (e) {
      console.log(e);
      if (e.response) {
        return e.response;
      } else {
        return { data: { error: "Some error occured" } };
      }
    }
  };

  const resetPassword = async (resetToken, password, passwordConfirm) => {
    try {
      const response = await axios.patch(
        SERVER_URL + "/auth/resetpassword/" + resetToken,
        {
          password: password,
          passwordConfirm: passwordConfirm,
        }
      );
     
      return response;
      
    } catch (e) {
      console.log(e);
      if (e.response) {
        return e.response;
      } else {
        return { data: { error: "Some error occured" } };
      }
    }
  };

  const checkLoginStatus = async (token) => {
    try {
      const response = await axios.get(SERVER_URL + "/api/user", {
        headers:{
          'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8',
          token: token,
        }
      });
     
      if (response.status == 200) {
        console.log(response.data.email)
        setUser({email:response.data.email,first_name:response.data.first_name});
        
        return response.data;
      }
      return null;
    } catch (e) {
      console.log(e)
      return null;
    }
  };

  return (
    <authContext.Provider
      value={{
        user,
        setUser,
        login,
        signup,
        checkLoginStatus,
        verifyEmail,
        resetPassword,
        forgotPassword,
        alert,
        setAlert,
      }}
    >
      {props.children}
    </authContext.Provider>
  );
};

export default AuthState;
