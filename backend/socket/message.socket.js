import { getIO } from "./socket.js";

export const emitNewMessage = (
  receiverId,
  message
) => {
  try {
    const io = getIO();

    io.to(`user:${receiverId}`).emit(
      "message:new",
      message
    );

    console.log(
      `💬 Message emitted to user: ${receiverId}`
    );
  } catch (error) {
    console.error(
      "Message socket emit error:",
      error
    );
  }
};


export const emitMessageRead = (
  senderId,
  data
) => {
  try {
    const io = getIO();

    io.to(`user:${senderId}`).emit(
      "message:read",
      data
    );

    console.log(
      `✓ Message read emitted to user: ${senderId}`
    );
  } catch (error) {
    console.error(
      "Message read socket emit error:",
      error
    );
  }
};