import React, { useState, useRef } from "react";
import Lobby from "./components/Lobby";
import ChatRoom from "./components/ChatRoom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [chatTarget, setChatTarget] = useState(null);
  const localStream = useRef(null);

  return (
    <div className="container py-4">
      <h2 className="text-center">💬 Simple WebRTC Chat</h2>
      {!chatTarget ? (
        <Lobby
          socket={socket}
          username={username}
          setUsername={setUsername}
          setChatTarget={setChatTarget}
        />
      ) : (
        <ChatRoom
          socket={socket}
          from={username}
          to={chatTarget}
          onExit={() => setChatTarget(null)}
          localStream={localStream}
        />
      )}
    </div>
  );
}

export default App;
