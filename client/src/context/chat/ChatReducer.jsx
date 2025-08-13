const ChatReducer = (state, action) => {
  switch (action.type) {
    case "SET_LIVE_USERS":
      return {
        ...state,
        onlineUsers: action.payload,
      };

    case "SET_CURRENT_CHAT":
      return {
        ...state,
        currentChat: action.payload,
      };

    case "SEND_CHAT_REQUEST":
      return {
        ...state,
        sentChatRequest: action.payload,
      };

    case "RECEIVE_CHAT_REQUEST":
      return {
        ...state,
        receivedChatRequest: action.payload,
      };

    case "CHAT_ERROR":
      return {
        ...state,
        chatError: action.payload,
      };
    default:
      return state;
  }
};

export default ChatReducer;
