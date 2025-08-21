const ChatReducer = (state, action) => {
  switch (action.type) {
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

    case "SET_ICE_CANDIDATE":
      return {
        ...state,
        chatIceCandidates: {
          ...state.chatIceCandidates,
          [action.payload.from.id]: [
            ...(state.chatIceCandidates[action.payload.from.id] || []),
            action.payload.candidate,
          ],
        },
      };

    case "CLEAR_ICE_CANDIDATE":
      const updatedIceCandidates = { ...state.chatIceCandidates };
      delete updatedIceCandidates[action.payload];
      return {
        ...state,
        chatIceCandidates: updatedIceCandidates,
      };

    case "SET_OFFER":
      return {
        ...state,
        chatOffers: {
          ...state.chatOffers,
          [action.payload.from.id]: action.payload.offer,
        },
      };

    case "CLEAR_OFFER":
      const updatedOffers = { ...state.chatOffers };
      delete updatedOffers[action.payload];
      return {
        ...state,
        chatOffers: updatedOffers,
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
