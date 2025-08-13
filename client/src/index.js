import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap";
import UserAction from "./context/user/UserAction";
import ChatAction from "./context/chat/ChatAction";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <UserAction>
    <ChatAction>
      <App />
    </ChatAction>
  </UserAction>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
