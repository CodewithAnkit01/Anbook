import { io } from "socket.io-client";
import { getToken } from "../utils/token";

// TEMPORARY: hardcoded, same as api.js. Update the port to your backend's.
const SOCKET_URL = "http://localhost:3000";

let socket = null;

export const connectSocket = () => {
  const token = getToken();
  if (!token) return null;
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
  });

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;