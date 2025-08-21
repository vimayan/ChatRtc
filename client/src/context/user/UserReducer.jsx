const UserReducer = (state, action) => {
  switch (action.type) {
    case "CREATE_SOCKET":
      return {
        ...state,
        socket: action.payload,
      };
    case "SET_LIVE_USERS":
      return {
        ...state,
        onlineUsers: action.payload,
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
