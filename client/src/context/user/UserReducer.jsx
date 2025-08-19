const UserReducer = (state, action) => {
  switch (action.type) {
    case "CREATE_SOCKET":
      return {
        ...state,
        socket: action.payload,
      };

    case "CREATE_USER":
      return {
        ...state,
        ...action.payload,
      };

    case "CREATE_PEER":
      return {
        ...state,
        peerConnection: action.payload,
      };

    case "UPDATE_PEER":
      // Update the state with the updated peer connection
      return {
        ...state,
        peerConnection: action.payload,
      };

    case "CREATE_DATA_CHANNEL":
      return {
        ...state,
        dataChannel: action.payload,
      };

    case "ADD_DATA_CHANNEL":
      return {
        ...state,
        dataChannel: { ...state.dataChannel, ...action.payload },
      };

    case "SET_ICE_CANDIDATE":
      return {
        ...state,
        iceCandidates: {
          ...state.iceCandidates,
          [action.payload.from.id]: [
            ...(state.iceCandidates[action.payload.from.id] || []),
            action.payload.candidate,
          ],
        },
      };

    case "CLEAR_ICE_CANDIDATE":
      const updatedIceCandidates = { ...state.iceCandidates };
      delete updatedIceCandidates[action.payload];
      return {
        ...state,
        iceCandidates: {},
      };

    case "SET_OFFER":
      return {
        ...state,
        offers: {
          ...state.offers,
          [action.payload.from.id]: action.payload.offer,
        },
      };

    case "CLEAR_OFFER":
      const updatedOffers = { ...state.offers };
      delete updatedOffers[action.payload];
      return {
        ...state,
        offers: {},
      };

    case "USER_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default UserReducer;
