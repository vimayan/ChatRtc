import React, { useReducer } from "react";
import ChatReducer from "./ChatReducer";
import ChatContext from "./ChatContext";

function ChatAction(props) {
  const userInitial = {
    currentChat: null,
    chatRequests: [],
    chatIceCandidates: {},
    chatOffers: {},
    chatError: {},
  };
  const [state, dispatch] = useReducer(ChatReducer, userInitial);

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
  const setChatIceCandidates = (from, candidate) => {
    console.log("setIceCandidates", from, candidate);
    dispatch({
      type: "SET_ICE_CANDIDATE",
      payload: { from, candidate },
    });
  };
  const setChatOffers = (from, offer) => {
    console.log("setOffers", from, offer);
    dispatch({
      type: "SET_OFFER",
      payload: { from, offer },
    });
  };
  const clearChatConnections = (from) => {
    dispatch({
      type: "CLEAR_ICE_CANDIDATE",
      payload: from.id,
    });
    dispatch({
      type: "CLEAR_OFFER",
      payload: from.id,
    });
  };
  return (
    <ChatContext.Provider
      value={{
        currentChat: state.currentChat,
        chatRequests: state.chatRequests,
        chatIceCandidates: state.chatIceCandidates,
        chatOffers: state.chatOffers,
        chatError: state.chatError,
        setCurrentChat,
        addReceivedRequests,
        updateReceivedRequests,
        createChatrequest,
        ExitChat,
        setChatIceCandidates,
        setChatOffers,
        clearChatConnections,
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
}

export default ChatAction;
