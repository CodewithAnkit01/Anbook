import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

import Avatar from "./Avatar";
import { describeNotification } from "../utils/notificationText";
import { timeAgo } from "../utils/timeAgo";

const NotificationItem = ({ notification, onRead, onDelete, compact = false }) => {
  const { text, link } = describeNotification(notification);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition ${
        notification.isRead ? "" : "bg-indigo-50/60"
      } hover:bg-gray-50`}
    >
      <Link
        to={link}
        onClick={() => !notification.isRead && onRead(notification.id)}
        className="flex min-w-0 flex-1 items-start gap-3"
      >
        <Avatar user={notification.sender} size="sm" className="shrink-0" />
        <div className="min-w-0">
          <p className="text-sm text-gray-800">{text}</p>
          <p className="mt-0.5 text-xs text-gray-500">{timeAgo(notification.createdAt)}</p>
        </div>
        {!notification.isRead && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-label="Unread" />
        )}
      </Link>

      {!compact && (
        <button
          onClick={() => onDelete(notification.id)}
          aria-label="Delete notification"
          className="shrink-0 rounded-full p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default NotificationItem;