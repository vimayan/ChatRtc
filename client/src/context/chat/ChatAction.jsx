import React, { useReducer } from "react";
import ChatReducer from "./ChatReducer";
import ChatContext from "./ChatContext";

function ChatAction(props) {
  const userInitial = {
    onlineUsers: [],
    currentChat: null,
    sentChatRequest: [],
    receivedChatRequest: [],
    chatError: {},
  };
  const [state, dispatch] = useReducer(ChatReducer, userInitial);

  const setOnlineUsers = async (liveUsers, user) => {
    const userList = liveUsers.filter((u) => u.id !== user.id);
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
  const updateSendChatRequest = async (user) => {
    dispatch({
      type: "SEND_CHAT_REQUEST",
      payload: user,
    });
  };
  const updateReceivedRequests = async (user) => {
    dispatch({
      type: "RECEIVE_CHAT_REQUEST",
      payload: user,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        onlineUsers: state.onlineUsers,
        currentChat: state.currentChat,
        sentChatRequest: state.sentChatRequest,
        receivedChatRequest: state.receivedChatRequest,
        chatError: state.chatError,
        setOnlineUsers,
        setCurrentChat,
        updateSendChatRequest,
        updateReceivedRequests,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
}

export default ChatAction;
