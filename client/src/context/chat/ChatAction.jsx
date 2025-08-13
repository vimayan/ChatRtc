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

  const setOnlineUsers = async (liveUsers, socketId) => {
    const userList = liveUsers.filter((u) => u.id !== socketId);
    dispatch({
      type: "SET_LIVE_USERS",
      payload: userList,
    });
  };
  const setCurrentChat = async (user) => {
    dispatch({
      type: "SET_CURRENT_CHAT",
      payload: user,
    });
  };

  const addReceivedRequests = async (socketId) => {
    const userList = [...state.chatRequests];
    dispatch({
      type: "RECEIVED_CHAT_REQUEST",
      payload: [...userList, socketId],
    });
  };
  const updateReceivedRequests = async (socketId) => {
    const userList = state.chatRequests.filter((u) => u !== socketId);
    dispatch({
      type: "RECEIVED_CHAT_REQUEST",
      payload: userList,
    });
  };
  const createChatrequest = (newUser, socket) => {
    console.log("createChatrequest", newUser);
    socket.emit("chat-user", socket.id, newUser.id);
    setCurrentChat(newUser);
  };
  const ExitChat = (to) => {
    setCurrentChat(null);
    updateReceivedRequests(to.id);
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
