import React, { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import TextChat from "./component/TextChat";
import UserContext from "./context/user/UserContext";
import ChatContext from "./context/chat/ChatContext";

function App() {
  const [username, setUsername] = useState("");
  const [chatRequest, setChatRequest] = useState([]);

  const socketRef = useRef();
  const userContext = useContext(UserContext);
  const { socketConnection, userName, socketId, createUser } = userContext;
  const chatContext = userContext(ChatContext);
  const {
    setOnlineUsers,
    onlineUsers,
    setCurrentChat,
    currentChat,
    updateSendChatRequest,
    updateReceivedRequests,
  } = chatContext;
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socketConnection(socket);
    socket.on("users", (users) => {
      setOnlineUsers(users);
      console.log("users", users);
    });

    // Handle new user connection
    socket.on("receive-request", (newUser) => {
      console.log(`User connected: ${newUser}`);
      setChatRequest((prev) => [...prev, newUser]);
    });
    socket.on("cancelled-request", (cancelledUser) => {
      console.log(`User disconnected: ${cancelledUser}`);
      setChatRequest((prev) => prev.filter((u) => u !== cancelledUser));
    });
  }, []);

  const handleRegister = () => {
    if (username) {
      socketRef.current.emit("register", username, () => {
        console.log("registered");
        createUser(username, socketRef.current.id);
      });
    }
  };

  const handleChatrequest = (requestedUser) => {
    setCurrentChat(requestedUser);
  };

  const createChatrequest = (newUser) => {
    console.log("createChatrequest", newUser);
    socketRef.current.emit("chat-user", username, newUser.id);
    setCurrentChat(newUser);
  };
  const handleExitChat = (to) => {
    setCurrentChat(null);
    setChatRequest((prev) => prev.filter((u) => u !== to.name));
  };
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
          <button className="btn btn-primary mb-3" onClick={handleRegister}>
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
                {chatRequest.includes(user.name) ? (
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleChatrequest(user)}
                  >
                    accept
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => createChatrequest(user)}
                  >
                    Chat
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <TextChat to={currentChat} from={username} onBack={handleExitChat} />
      )}
    </div>
  );
}

export default App;
