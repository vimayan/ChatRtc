import React, { useReducer } from "react";
import UserReducer from "./UserReducer";
import UserContext from "./UserContext";

function UserAction(props) {
  const userInitial = {
    userName: "",
    socketId: "",
    socket: null,
    onlineUsers: [],
    iceCandidates: {},
    offers: {},
    error: {},
  };

  const [state, dispatch] = useReducer(UserReducer, userInitial);
  const socketConnection = async (socket) => {
    // Handle new user connection
    console.log("socket", socket);
    dispatch({
      type: "CREATE_SOCKET",
      payload: socket,
    });
  };
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
        onlineUsers: state.onlineUsers,
        socket: state.socket, 
        error: state.error,
        socketConnection,
        setOnlineUsers,
        createUser,
        handleRegister,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
}

export default UserAction;
