import React, { createContext } from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { BrowserRouter } from "react-router-dom";
import AuthState from "./context/auth/authState";
import ApiState  from "./context/api/apiState";
import NftState from "./context/nft/nftState";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthState>
      <ApiState>
        <NftState>
        <App />
        </NftState>
      </ApiState>
    </AuthState>
  </BrowserRouter>
);
