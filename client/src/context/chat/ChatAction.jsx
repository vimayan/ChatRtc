import React, { useReducer } from "react";
import ChatReducer from "./ChatReducer";
import ChatContext from "./ChatContext";

function ChatAction(props) {
  const userInitial = {
    onlineUsers: [],
    currentChat: null,
    chatRequests: [],
    chatError: {},
  };
  const [state, dispatch] = useReducer(ChatReducer, userInitial);

  const setOnlineUsers = async (socket) => {
    socket.on("users", (users) => {
      console.log("users", users);
      const userList = users.filter((u) => u.id !== socket.id);
      console.log(userList, "userList");
      dispatch({
        type: "SET_LIVE_USERS",
        payload: userList,
      });
    });
  };
  const setCurrentChat = async (user) => {
    dispatch({
      type: "SET_CURRENT_CHAT",
      payload: user,
    });
  };

  const addReceivedRequests = async (socket) => {
    socket.on("receive-request", (newUserId) => {
      console.log(`Received Request: ${newUserId}`);
      dispatch({
        type: "RECEIVED_CHAT_REQUEST",
        payload: newUserId,
      });
    });
  };
  const updateReceivedRequests = async (socket) => {
    socket.on("cancelled-request", (cancelledUser) => {
      console.log(`Request Cancelled: ${cancelledUser}`);
      dispatch({
        type: "REMOVE_CHAT_REQUEST",
        payload: cancelledUser,
      });
    });
  };
  const createChatrequest = (newUser, socket) => {
    console.log("createChatrequest", newUser);
    socket.emit("chat-user", socket.id, newUser.id);
    setCurrentChat(newUser);
  };
  const ExitChat = (to) => {
    setCurrentChat(null);
    dispatch({
      type: "REMOVE_CHAT_REQUEST",
      payload: to.id,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        onlineUsers: state.onlineUsers,
        currentChat: state.currentChat,
        chatRequests: state.chatRequests,
        chatError: state.chatError,
        setOnlineUsers,
        setCurrentChat,
        addReceivedRequests,
        updateReceivedRequests,
        createChatrequest,
        ExitChat,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
}

export default ChatAction;
