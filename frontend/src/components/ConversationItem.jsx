import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import Avatar from "./Avatar";
import { timeAgo } from "../utils/timeAgo";
import { usePresence } from "../context/PresenceContext";

const ConversationItem = ({ conversation, isActive }) => {
  const { user, lastMessage, isUnread } = conversation;
  const { isOnline } = usePresence();

  return (
    <Link
      to={`/messages/${conversation.id}`}
      state={{ otherUser: conversation.user }}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
        isActive ? "bg-indigo-50" : "hover:bg-gray-50"
      }`}
    >
      <Avatar
        user={user}
        size="md"
        className="shrink-0"
        online={isOnline(user.id)}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span
            className={`truncate text-sm ${
              isUnread
                ? "font-bold text-gray-900"
                : "font-medium text-gray-800"
            }`}
          >
            {user.username}
          </span>

          {user.isVerified && (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
          )}
        </div>

        <p
          className={`truncate text-sm ${
            isUnread
              ? "font-semibold text-gray-900"
              : "text-gray-500"
          }`}
        >
          {lastMessage ? lastMessage.content : "Say hello 👋"}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {lastMessage && (
          <span className="text-xs text-gray-400">
            {timeAgo(lastMessage.createdAt)}
          </span>
        )}

        {isUnread && (
          <span
            className="h-2 w-2 rounded-full bg-indigo-500"
            aria-label="Unread"
          />
        )}
      </div>
    </Link>
  );
};

export default ConversationItem;