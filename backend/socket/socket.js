
import { Server } from "socket.io";
import { socketAuth } from "./socket.auth.js";

let io;

// userId -> Set of socket IDs
const onlineUsers = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // ==========================================
  // SOCKET AUTHENTICATION
  // ==========================================

  io.use(socketAuth);

  // ==========================================
  // CONNECTION
  // ==========================================

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    console.log(
      `🟢 User connected: ${socket.user.username}`
    );

    // ==========================================
    // USER ROOM
    // ==========================================

    socket.join(`user:${userId}`);

    // ==========================================
    // ONLINE USERS
    // ==========================================

    // First socket connection for this user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());

      // Tell other connected users that this user
      // is now online
      socket.broadcast.emit("user:online", {
        userId,
      });
    }

    // Add this socket to the user's socket set
    onlineUsers.get(userId).add(socket.id);

    // ==========================================
    // CONNECTION SUCCESS
    // ==========================================

    socket.emit("connected", {
      success: true,
      message: "Connected to real-time server.",
      onlineUsers: Array.from(onlineUsers.keys()),
    });

    // ==========================================
    // NOTIFICATION READ
    // ==========================================

    socket.on("notification:read", (notificationId) => {
      try {
        if (!notificationId) {
          return;
        }

        socket.emit("notification:read:success", {
          notificationId,
        });
      } catch (error) {
        console.error(
          "Notification read socket error:",
          error
        );
      }
    });

    // ==========================================
    // MESSAGE READ
    // ==========================================

    socket.on("message:read", (data) => {
      try {
        const {
          messageId,
          senderId,
          conversationId,
        } = data || {};

        if (!messageId || !senderId) {
          return socket.emit("message:error", {
            success: false,
            message:
              "Message ID and sender ID are required.",
          });
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
      try {
        const {
          receiverId,
          conversationId,
        } = data || {};

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
      } catch (error) {
        console.error(
          "Typing start socket error:",
          error
        );
      }
    });

    // ==========================================
    // TYPING STOP
    // ==========================================

    socket.on("typing:stop", (data) => {
      try {
        const {
          receiverId,
          conversationId,
        } = data || {};

        if (!receiverId || !conversationId) {
          return;
        }

        socket
          .to(`user:${receiverId}`)
          .emit("typing:stop", {
            conversationId,
            userId,
          });
      } catch (error) {
        console.error(
          "Typing stop socket error:",
          error
        );
      }
    });

    // ==========================================
    // DISCONNECT
    // ==========================================

    socket.on("disconnect", (reason) => {
      console.log(
        `🔴 User disconnected: ${socket.user.username}`,
        reason
      );

      const userSockets = onlineUsers.get(userId);

      if (!userSockets) {
        return;
      }

      // Remove only this socket
      userSockets.delete(socket.id);

      // If user has no remaining sockets,
      // mark the user as offline
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);

        socket.broadcast.emit("user:offline", {
          userId,
        });
      }
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

// ==========================================
// GET ONLINE USERS
// ==========================================

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

