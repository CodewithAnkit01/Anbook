import { Server } from "socket.io";
import { socketAuth } from "./socket.auth.js";

let io;

const onlineUsers = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Socket authentication
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    console.log(
      `🟢 User connected: ${socket.user.username}`
    );

    // ==========================================
    // PERSONAL USER ROOM
    // ==========================================

    socket.join(`user:${userId}`);

    // ==========================================
    // ONLINE USERS
    // ==========================================

    onlineUsers.set(userId, socket.id);

    socket.broadcast.emit("user:online", {
      userId,
    });

    // ==========================================
    // CONNECTION CONFIRMATION
    // ==========================================

    socket.emit("connected", {
      success: true,
      message: "Connected to real-time server.",
    });

    // ==========================================
    // NOTIFICATION READ
    // ==========================================

    socket.on(
      "notification:read",
      (notificationId) => {
        socket.emit(
          "notification:read:success",
          {
            notificationId,
          }
        );
      }
    );

    // ==========================================
    // MESSAGE READ
    // ==========================================

    socket.on("message:read", (data) => {
      try {
        const {
          messageId,
          senderId,
          conversationId,
        } = data;

        if (!messageId || !senderId) {
          return socket.emit(
            "message:error",
            {
              success: false,
              message:
                "Message ID and sender ID are required.",
            }
          );
        }

        socket
          .to(`user:${senderId}`)
          .emit("message:read", {
            messageId,
            conversationId,
            readBy: userId,
            readAt: new Date(),
          });
      } catch (error) {
        console.error(
          "Message read socket error:",
          error
        );
      }
    });

    // ==========================================
    // TYPING START
    // ==========================================

    socket.on("typing:start", (data) => {
      const {
        receiverId,
        conversationId,
      } = data;

      if (!receiverId || !conversationId) {
        return;
      }

      socket
        .to(`user:${receiverId}`)
        .emit("typing:start", {
          conversationId,
          userId,
          username: socket.user.username,
        });
    });

    // ==========================================
    // TYPING STOP
    // ==========================================

    socket.on("typing:stop", (data) => {
      const {
        receiverId,
        conversationId,
      } = data;

      if (!receiverId || !conversationId) {
        return;
      }

      socket
        .to(`user:${receiverId}`)
        .emit("typing:stop", {
          conversationId,
          userId,
        });
    });

    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on("disconnect", (reason) => {
      console.log(
        `🔴 User disconnected: ${socket.user.username}`,
        reason
      );

      onlineUsers.delete(userId);

      socket.broadcast.emit(
        "user:offline",
        {
          userId,
        }
      );
    });
  });

  console.log("🔌 Socket.IO initialized");

  return io;
};


// ==========================================
// GET SOCKET.IO INSTANCE
// ==========================================

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized."
    );
  }

  return io;
};


// ==========================================
// CHECK ONLINE STATUS
// ==========================================

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};