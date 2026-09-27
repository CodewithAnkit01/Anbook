import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, MessageCircle, RefreshCw } from "lucide-react";

import ConversationItem from "../components/ConversationItem";
import { getSocket } from "../services/socket";
import { fetchConversations } from "../services/messageService";
import { useAuth } from "../context/AuthContext";
import getErrorMessage from "../utils/getErrorMessage";

const Messages = ({ children }) => {
  const { conversationId } = useParams();
  const { user: me } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data.conversations);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message) => {
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === message.conversationId);
        if (!exists) {
          load(); // new conversation we don't have yet: refetch the whole list
          return prev;
        }
        const isMine = message.senderId === me.id;
        const updated = prev.map((c) =>
          c.id === message.conversationId
            ? { ...c, lastMessage: message, isUnread: !isMine, updatedAt: message.createdAt }
            : c
        );
        // bump the updated conversation to the top
        const target = updated.find((c) => c.id === message.conversationId);
        return [target, ...updated.filter((c) => c.id !== message.conversationId)];
      });
    };

    const handleReconnect = () => load();

    socket.on("message:new", handleNewMessage);
    socket.on("connect", handleReconnect);
    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("connect", handleReconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.id]);

  return (
    <div className="flex h-[calc(100vh-9rem)] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      <div
        className={`w-full shrink-0 overflow-y-auto border-r border-gray-100 sm:w-80 ${
          conversationId ? "hidden sm:block" : "block"
        }`}
      >
        <div className="border-b border-gray-100 px-4 py-3">
          <h1 className="font-semibold text-gray-900">Messages</h1>
        </div>

        <div className="space-y-0.5 p-2">
          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}

          {!loading && error && conversations.length === 0 && (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-gray-500">{error}</p>
              <button
                onClick={load}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>
            </div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="px-3 py-10 text-center">
              <MessageCircle className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No conversations yet.</p>
            </div>
          )}

          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === conversationId}
            />
          ))}
        </div>
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${conversationId ? "flex" : "hidden sm:flex"}`}>
        {children || (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;