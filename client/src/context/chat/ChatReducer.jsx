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

    case "RECEIVED_CHAT_REQUEST":
      return {
        ...state,
        chatRequests: [action.payload, ...state.chatRequests],
      };

    case "REMOVE_CHAT_REQUEST":
      return {
        ...state,
        chatRequests: state.chatRequests.filter((u) => u !== action.payload),
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
