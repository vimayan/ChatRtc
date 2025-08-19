import React, { useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import TextChat from "./component/TextChat";
import UserContext from "./context/user/UserContext";
import ChatContext from "./context/chat/ChatContext";
import AudioCall from "./component/AudioCall";

function App() {
  const [username, setUsername] = useState("");
  const socketRef = useRef();
  const userContext = useContext(UserContext);
  const {
    socketConnection,
    handleRegister,
    userName,
    socketId,
    iceCandidates,
    offers,
    setIceCandidates,
    setOffers,
  } = userContext;
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
    setOnlineUsers(socket);
    addReceivedRequests(socket);
    updateReceivedRequests(socket);
    socket.on("receive-offer", async (offer, from) => {
      console.log("receive-offer", offer, "from", from);
      setOffers(from, offer);
    });
    socket.on("receive-remote-candidate", (candidate, from) => {
      console.log("receive-candidate", candidate, "from", from);
      setIceCandidates(from, candidate);
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
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.keyCode === 13) {
                handleRegister(username);
              }
            }}
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
                    onClick={() => createChatrequest(user, socketRef.current)}
                  >
                    Chat
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        // <TextChat
        //   to={currentChat}
        //   from={{ id: socketId, name: userName }}
        //   offer={offers[currentChat.id]}
        //   iceCandidate={iceCandidates[currentChat.id]}
        // />
        <AudioCall 
          from={{ id: socketId, name: userName }}
          to={currentChat}
          offer={offers[currentChat.id]}
          iceCandidate={iceCandidates[currentChat.id]}
        />
      )}
    </div>
  );
}
export default App;

// import React, { useState, useRef } from "react";
// import Lobby from "./component/Lobby";
// import ChatRoom from "./component/ChatRoom";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000");

// function App() {
//   const [username, setUsername] = useState("");
//   const [chatTarget, setChatTarget] = useState(null);
//   const localStream = useRef(null);

//   return (
//     <div className="container py-4">
//       <h2 className="text-center">💬 Simple WebRTC Chat</h2>
//       {!chatTarget ? (
//         <Lobby
//           socket={socket}
//           username={username}
//           setUsername={setUsername}
//           setChatTarget={setChatTarget}
//         />
//       ) : (
//         <ChatRoom
//           socket={socket}
//           from={username}
//           to={chatTarget}
//           onExit={() => setChatTarget(null)}
//           localStream={localStream}
//         />
//       )}
//     </div>
//   );
// }

// export default App;
