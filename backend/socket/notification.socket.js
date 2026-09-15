import { getIO } from "./socket.js";

export const emitNotification = (userId, notification) => {
  try {
    const io = getIO();

    io.to(`user:${userId}`).emit(
      "notification:new",
      notification
    );

    console.log(
      `🔔 Notification emitted to user: ${userId}`
    );
  } catch (error) {
    console.error(
      "Notification socket emit error:",
      error
    );
  }
};