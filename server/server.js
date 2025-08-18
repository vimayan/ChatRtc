const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

// Initialize express and server
const app = express();
const server = http.createServer(app);

require("dotenv").config({ path: "./config/.env" });

// Initialize socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

// Middleware for handling CORS
app.use(cors());

const onlineUsers = {};

io.on("connection", (socket) => {
  socket.on("register", (username, callback) => {
    onlineUsers[socket.id] = username;
    io.emit(
      "users",
      Object.entries(onlineUsers).map(([id, name]) => ({ id, name }))
    );
    callback();
  });

  // socket.on("register", (username) => {
  //   onlineUsers[socket.id] = username;
  //   io.emit(
  //     "users",
  //     Object.entries(onlineUsers).map(([id, name]) => ({ id, name }))
  //   );
  // });
  // Handle initial users list
  socket.on("chat-user", (from, to) => {
    console.log(from, to, "chat-user");
    socket.broadcast.to(to).emit("receive-request", from);
    // if (from === to) {
    //   return;
    // } else if (!onlineUsers[from] || !onlineUsers[to]) {
    //   return;
    // } else {
    //   socket.broadcast.emit("user-connected", to);
    // }
  });

  socket.on("send-local-candidate", (to, from, candidate) => {
    console.log(`Sending local ICE candidate to ${from.name}`);
    socket.to(to.id).emit("receive-remote-candidate", candidate, from);
  });

  // Receive and forward ICE candi
  // dates
  socket.on("send-candidate", (user, candidate) => {
    console.log(`Sending ICE candidate to ${user.name}`);
    socket.to(user.id).emit("receive-candidate", candidate);
  });

  // Receive and forward WebRTC offer
  socket.on("send-offer", (to, from, offer) => {
    console.log(`Sending offer from ${to.id}`);
    socket.to(to.id).emit("receive-offer", offer, from);
  });

  // Receive and forward WebRTC answer
  socket.on("send-answer", (userId, answer) => {
    console.log("Sending answer");
    socket.to(userId.id).emit("receive-answer", answer);
  });
  socket.on("exit-chat", (userId, user) => {
    socket.to(userId.id).emit("cancelled-request", user);
  });

  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit(
      "users",
      Object.entries(onlineUsers).map(([id, name]) => ({ id, name }))
    );
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
