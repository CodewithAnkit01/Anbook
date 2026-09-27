import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { connectSocket, disconnectSocket } from "../services/socket";

const PresenceContext = createContext(null);

export const PresenceProvider = ({ children }) => {
  const { token } = useAuth();
  const [onlineIds, setOnlineIds] = useState(() => new Set());

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setOnlineIds(new Set());
      return;
    }

    const socket = connectSocket();
    if (!socket) return;

    const handleConnected = (data) => setOnlineIds(new Set(data.onlineUsers));
    const handleOnline = ({ userId }) => setOnlineIds((prev) => new Set(prev).add(userId));
    const handleOffline = ({ userId }) =>
      setOnlineIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

    socket.on("connected", handleConnected);
    socket.on("user:online", handleOnline);
    socket.on("user:offline", handleOffline);

    return () => {
      socket.off("connected", handleConnected);
      socket.off("user:online", handleOnline);
      socket.off("user:offline", handleOffline);
    };
  }, [token]);

  return (
    <PresenceContext.Provider value={{ isOnline: (id) => onlineIds.has(id) }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (!context) throw new Error("usePresence must be used inside <PresenceProvider>");
  return context;
};