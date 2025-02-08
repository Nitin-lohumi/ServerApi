import express from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./lib/connect.js";
import Message from "./model/message.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.use(express.json());
await connectDB();
const users = new Map();

io.on("connection", async (socket) => {
  io.emit("userCount", io.engine.clientsCount); 
  socket.on("userJoined", (username) => {
    if (!users.has(socket.id)) {
      users.set(socket.id, username || "Unknown User");
      console.log(`${username} joined`);
      socket.broadcast.emit("newUser", { username }); 
    }
  });
  socket.on("message", async (msg) => {
    try {
      const sendmsg = {
        name: msg.name || "Unknown",
        message: msg.message,
        time: new Date().toLocaleTimeString(),
      };
      const newMessage = new Message({
        SenderName: msg.name || "Unknown",
        message: msg.message,
        image: msg.image || null,
      });
      await newMessage.save();
      io.emit("message", sendmsg);
    } catch (error) {
      console.log("Error saving message:", error);
    }
  });
  socket.on("disconnect", () => {
    const username = users.get(socket.id) || "user";
    users.delete(socket.id);
    socket.broadcast.emit("userLeft", username);
    io.emit("userCount", io.engine.clientsCount);
  });
});

app.get("/",(req,res)=>{
  res.send("Server is running!");
})

app.get("/api/message", async (req, res) => {
  try {
    const messages = await Message.find();
    if (messages.length > 0) {
      return res.status(200).json({ message: messages });
    } else {
      return res.status(404).json({ message: "No messages found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving messages" });
  }
});
const Port  = process.env.PORT||10000
server.listen(Port, () => {
  console.log(`Socket.IO server running on ${Port}`);
});
