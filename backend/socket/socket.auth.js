import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export const socketAuth = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication required."));
    }

   const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id
      },

      select: {
        id: true,
        username: true,
        role: true,
        isBanned: true
      }
    });

    if (!user) {
      return next(new Error("User not found."));
    }

    if (user.isBanned) {
      return next(new Error("Account is banned."));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);

    next(new Error("Invalid or expired token."));
  }
};