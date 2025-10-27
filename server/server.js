import express from "express";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/roomRoutes.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Store drawing history per room
const roomHistory = {};

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, callback) => {
    socket.join(roomId);

    if (!roomHistory[roomId]) roomHistory[roomId] = [];

    const userCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    io.to(roomId).emit("user-count", userCount);

    // Send existing history to new user
    if (callback) callback(roomHistory[roomId]);
  });

  socket.on("draw", ({ roomId, data }) => {
    if (!roomHistory[roomId]) roomHistory[roomId] = [];

    if (data.clear) {
      roomHistory[roomId] = [];
      io.to(roomId).emit("draw", { clear: true });
    } else {
      roomHistory[roomId].push(data);
      socket.to(roomId).emit("draw", data);
    }
  });

  socket.on("chat-message", ({ roomId, username, message }) => {
    io.to(roomId).emit("chat-message", { username, message });
  });

  socket.on("disconnect", () => {
    socket.rooms.forEach((roomId) => {
      const count = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      io.to(roomId).emit("user-count", count);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
