import React, { useEffect, useState } from "react";

const Lobby = ({ socket, username, setUsername, setChatTarget }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.on("users", (users) => {
      setOnlineUsers(users.filter((u) => u.name !== username));
    });
  }, [socket, username]);

  const handleJoin = () => {
    if (username) {
      socket.emit("register", username);
    }
  };

  const requestChat = (user) => {
    socket.emit("chat-user", username, user.id);
    setChatTarget(user);
  };

  return (
    <div className="card mt-4 p-4">
      <input
        className="form-control mb-3"
        placeholder="Enter your name"
        onChange={(e) => setUsername(e.target.value)}
      />
      <button className="btn btn-primary mb-4" onClick={handleJoin}>
        Join Chat
      </button>

      <h5>Online Users</h5>
      <ul className="list-group">
        {onlineUsers.map((user) => (
          <li key={user.id} className="list-group-item d-flex justify-content-between">
            {user.name}
            <button className="btn btn-outline-success btn-sm" onClick={() => requestChat(user)}>
              Chat
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
