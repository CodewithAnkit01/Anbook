import { Server } from "socket.io";
import { socketAuth } from "./socket.auth.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  // Socket authentication
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    console.log(
      `🟢 User connected: ${socket.user.username}`
    );

    // Private room for each user
    socket.join(`user:${userId}`);

    // Send connection confirmation
    socket.emit("connected", {
      success: true,
      message: "Connected to real-time server."
    });

    // Client manually marks notification as read
    socket.on("notification:read", (notificationId) => {
      socket.emit("notification:read:success", {
        notificationId
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `🔴 User disconnected: ${socket.user.username}`,
        reason
      );
    });
  });

  console.log("🔌 Socket.IO initialized");

  return io;
};


export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized."
    );
  }

  return io;
};