import axios from "axios";
import { SERVER_URL } from "../../constants";
import apiContext from "./apiContext";
import { useState } from "react";

const ApiState = (props) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState("vol@gmail.com");
  const [messageHistory, setMessageHistory] = useState([]);

  const getProfile = async (email, token) => {
    console.log(email, "yash");
    try {
      if (email) {
        const response = await axios.get(SERVER_URL + "/api/profile/" + email, {
          headers: {
            token: token,
          },
        });
        return response;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const allProfiles = async (token) => {
    try {
      const response = await axios.get(SERVER_URL + "/api/allProfile", {
        headers: {
          token: token,
        },
      });
      setUsers(response.data);
      return response;
    } catch (e) {
      console.log(e);
    }
  };

  const updateProfile = async (email, first_name, last_name, token) => {
    try {
      const response = await axios.post(
        SERVER_URL + "/api/updateProfile",
        {
          email: email,
          first_name: first_name,
          last_name: last_name,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      return response;
    } catch (e) {
      console.log(e);
    }
  };

  const onlineAt = async (email, token) => {
    try {
      const response = await axios.get(SERVER_URL + "/api/onlineAt/" + email, {
        headers: {
          token: token,
        },
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  };

  const getAllMessages = async (email, token) => {
    try {
      const response = await axios.get(SERVER_URL + "/api/message/" + email, {
        headers: {
          token: token,
        },
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  };
  const editMessage = async (text, id, token) => {
    try {
      const response = await axios.put(
        SERVER_URL + "/api/editMessage/" + id,
        {
          text: text,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      return response;
    } catch (e) {
      console.log(e);
    }
  };
  const deleteMessage = async (id, token) => {
    try {
      const response = await axios.delete(
        SERVER_URL + "/api/deleteMessage/" + id,
        {
          headers: {
            token: token,
          },
        }
      );
      return response;
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <apiContext.Provider
      value={{
        getProfile,
        allProfiles,
        updateProfile,
        onlineAt,
        getAllMessages,
        editMessage,
        deleteMessage,
        users,
        setUsers,
        currentChat,
        setCurrentChat,
        messageHistory,
        setMessageHistory,
      }}
    >
      {props.children}
    </apiContext.Provider>
  );
};

export default ApiState;
