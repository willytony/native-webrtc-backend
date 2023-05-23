const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "https://videochat-qesc.onrender.com",
    methods: ["GET", "POST"],
  },
});

const port = 8000;
server.listen(port, () => console.log(`server is running on port ${port}`));
const rooms = {};

io.on("connection", (socket) => {
  console.log("current socketId", socket.id);
  socket.on("join room", (roomID) => {
    console.log("joinroomID", roomID);
    if (rooms[roomID]) {
      //if existed roomID in rooms obj, it will trigger wen we pass the same param to another page
      rooms[roomID].push(socket.id);
      console.log("if1", rooms); //
      console.log("if2", rooms[roomID]); //in rooms[roomID] print matched socketID's
    } else {
      rooms[roomID] = [socket.id];
      console.log("ELSE1", rooms); //in rooms obj saving roomID which is params came from client through 'join-room' evnt, & along with save socket.id
      console.log("ELSE2", rooms[roomID]); //rooms[roomID] = print saved socket.id in rooms[roomID] obj
    }
    const otherUser = rooms[roomID].find((id) => id !== socket.id); //wen we have the same params in 2browsers then in rooms[roomID] will have multiple socketID's so tat it can find the opposition id,
    console.log("otheruser", otherUser); //wen the 2nd user with same param enter, it will print the 1st socketID
    if (otherUser) {
      socket.emit("other user", otherUser);
      socket.to(otherUser).emit("user joined", socket.id);
    }
  });

  socket.on("offer", (payload) => {
    io.to(payload.target).emit("offer", payload);
  });

  socket.on("answer", (payload) => {
    io.to(payload.target).emit("answer", payload);
  });

  socket.on("ice-candidate", (incoming) => {
    io.to(incoming.target).emit("ice-candidate", incoming.candidate);
  });
});
