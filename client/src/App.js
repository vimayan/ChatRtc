import React, { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import TextChat from "./component/TextChat";
import UserContext from "./context/user/UserContext";
import ChatContext from "./context/chat/ChatContext";

function App() {
  const [username, setUsername] = useState("");

  const socketRef = useRef();
  const userContext = useContext(UserContext);
  const { socketConnection, handleRegister, userName, socketId, createUser } =
    userContext;
  const chatContext = useContext(ChatContext);
  const {
    setOnlineUsers,
    onlineUsers,
    setCurrentChat,
    currentChat,
    chatRequests,
    createChatrequest,
    addReceivedRequests,
    updateReceivedRequests,
  } = chatContext;

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socketConnection(socket);
    socket.on("users", (users) => {
      setOnlineUsers(users, socketRef.current.id);
      console.log("users", users);
    });

    // Handle new user connection
    socket.on("receive-request", (newUserId) => {
      console.log(`Received Request: ${newUserId}`);
      addReceivedRequests(newUserId);
    });

    socket.on("cancelled-request", (cancelledUser) => {
      console.log(`Request Cancelled: ${cancelledUser}`);
      updateReceivedRequests(cancelledUser);
    });
  }, []);

  return (
    <div className="container mt-5">
      {!currentChat ? (
        <div className="text-center">
          <h3>Welcome to Simple Chat</h3>
          <input
            className="form-control my-3"
            placeholder="Enter your name"
            onChange={(e) =>
              setUsername(e.target.value + Math.floor(Math.random() * 100))
            }
          />
          <button
            className="btn btn-primary mb-3"
            onClick={() => handleRegister(username)}
          >
            Join
          </button>
          <h5>Online Users</h5>
          <ul className="list-group">
            {onlineUsers.map((user) => (
              <li
                key={user.id}
                className="list-group-item d-flex justify-content-between"
              >
                {user.name}
                {chatRequests.includes(user.id) ? (
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => setCurrentChat(user)}
                  >
                    accept
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => createChatrequest(user,socketRef.current)}
                  >
                    Chat
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <TextChat to={currentChat} from={username} />
      )}
    </div>
  );
}

export default App;
