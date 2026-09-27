import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, BadgeCheck, Loader2 } from "lucide-react";

import Messages from "./Messages";
import Avatar from "../components/Avatar";
import MessageBubble from "../components/MessageBubble";
import MessageComposer from "../components/MessageComposer";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { usePresence } from "../context/PresenceContext";
import { getSocket } from "../services/socket";
import {
  fetchMessages,
  sendMessage,
  markMessageRead,
  deleteMessage,
} from "../services/messageService";
import getErrorMessage from "../utils/getErrorMessage";

const TYPING_IDLE_MS = 2000;

const ChatWindow = () => {
  const { conversationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const { isOnline } = usePresence();

  const [messages, setMessages] = useState([]); // oldest -> newest
  const [otherUser, setOtherUser] = useState(location.state?.otherUser ?? null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const bottomRef = useRef(null);
  const knownIds = useRef(new Set());
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  // Reset when switching conversations
  useEffect(() => {
    setMessages([]);
    setOtherUser(location.state?.otherUser ?? null);
    setOtherTyping(false);
    setLoading(true);
    knownIds.current = new Set();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const loadHistory = async () => {
    try {
      const data = await fetchMessages(conversationId, 1);
      const ordered = [...data.messages].reverse(); // newest-first -> oldest-first
      ordered.forEach((m) => knownIds.current.add(m.id));
      setMessages(ordered);

      const first = data.messages[0];
      if (first && first.senderId !== me.id) setOtherUser(first.sender);

      data.messages
        .filter((m) => m.senderId !== me.id && !m.isRead)
        .forEach((m) => markMessageRead(m.id).catch(() => {}));

      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Live: new messages, read receipts, resync after a dropped connection
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.conversationId !== conversationId) return;
      if (knownIds.current.has(message.id)) return;
      knownIds.current.add(message.id);
      setMessages((prev) => [...prev, message]);
      if (message.senderId !== me.id) {
        setOtherUser(message.sender);
        markMessageRead(message.id).catch(() => {});
      }
    };

    const handleMessageRead = (data) => {
      if (data.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === data.messageId ? { ...m, isRead: true } : m))
      );
    };

    const handleTypingStart = (data) => {
      if (data.conversationId === conversationId) setOtherTyping(true);
    };
    const handleTypingStop = (data) => {
      if (data.conversationId === conversationId) setOtherTyping(false);
    };

    const handleReconnect = () => loadHistory();

    socket.on("message:new", handleNewMessage);
    socket.on("message:read", handleMessageRead);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:read", handleMessageRead);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("connect", handleReconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, me.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Stop typing if you leave the chat mid-type
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current && otherUser) {
        getSocket()?.emit("typing:stop", { receiverId: otherUser.id, conversationId });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !otherUser) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing:start", { receiverId: otherUser.id, conversationId });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("typing:stop", { receiverId: otherUser.id, conversationId });
    }, TYPING_IDLE_MS);
  };

  const handleSend = async (text) => {
    clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current && otherUser) {
      isTypingRef.current = false;
      getSocket()?.emit("typing:stop", { receiverId: otherUser.id, conversationId });
    }

    try {
      const data = await sendMessage(conversationId, text);
      if (!knownIds.current.has(data.message.id)) {
        knownIds.current.add(data.message.id);
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      if (error.response?.status !== 401) toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessage(deleteTarget);
      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget));
    } catch (error) {
      if (error.response?.status !== 401) toast.error(getErrorMessage(error));
    } finally {
      setDeleteTarget(null);
    }
  };

  const lastMineId = [...messages].reverse().find((m) => m.senderId === me.id)?.id;

  return (
    <Messages>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
          <button
            onClick={() => navigate("/messages")}
            aria-label="Back to conversations"
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 sm:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {otherUser && (
            <Link
              to={`/profile/${encodeURIComponent(otherUser.username)}`}
              className="flex items-center gap-2"
            >
              <Avatar user={otherUser} size="sm" online={isOnline(otherUser.id)} />
              <div>
                <span className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                  {otherUser.username}
                  {otherUser.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-indigo-500" />}
                </span>
                <span className="text-xs text-gray-500">
                  {otherTyping ? "typing..." : isOnline(otherUser.id) ? "Active now" : ""}
                </span>
              </div>
            </Link>
          )}
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}

          {!loading && error && messages.length === 0 && (
            <p className="pt-10 text-center text-sm text-gray-500">{error}</p>
          )}

          {!loading && !error && messages.length === 0 && (
            <p className="pt-10 text-center text-sm text-gray-500">
              Say hello 👋 — this is the start of your conversation.
            </p>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={message.senderId === me.id}
              showSeen={message.id === lastMineId && message.isRead}
              onDelete={setDeleteTarget}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        <MessageComposer onSend={handleSend} onTyping={handleTyping} />
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this message?"
          message="This can't be undone."
          confirmText="Delete"
          loading={false}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </Messages>
  );
};

export default ChatWindow;