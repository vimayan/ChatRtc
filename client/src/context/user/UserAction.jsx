import React, { useReducer } from "react";
import UserReducer from "./UserReducer";
import UserContext from "./UserContext";

function UserAction(props) {
  const userInitial = {
    userName: "",
    socketId: "",
    peerConnection: {},
    dataChannel: {},
    socket: null,
    error: {},
  };

  const [state, dispatch] = useReducer(UserReducer, userInitial);
  const socketConnection = async (socket) => {
    console.log("socket", socket);
    dispatch({
      type: "CREATE_SOCKET",
      payload: socket,
    });
  };
  const createUser = async (userName, socketId) => {
    dispatch({
      type: "CREATE_USER",
      payload: { userName, socketId },
    });
  };

  const handleRegister = (user_name) => {
    if (user_name) {
      state.socket.emit("register", user_name, () => {
        dispatch({
          type: "CREATE_USER",
          payload: { userName: user_name, socketId: state?.socket.id },
        });
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        userName: state.userName,
        socketId: state.socketId,
        peerConnection: state.peerConnection,
        socket: state.socket,
        error: state.error,
        socketConnection,
        createUser,
        handleRegister,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
}

export default UserAction;
