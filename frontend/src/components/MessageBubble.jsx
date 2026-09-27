import { Trash2 } from "lucide-react";

const MessageBubble = ({ message, isMine, showSeen, onDelete }) => (
  <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
    <div className={`group flex max-w-[75%] items-end gap-1.5 ${isMine ? "flex-row-reverse" : ""}`}>
      <div
        className={`rounded-2xl px-3.5 py-2 text-sm ${
          isMine
            ? "rounded-br-sm bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white"
            : "rounded-bl-sm bg-gray-100 text-gray-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {isMine && (
        <button
          onClick={() => onDelete(message.id)}
          aria-label="Delete message"
          className="rounded-full p-1 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>

    {showSeen && <span className="mr-1 mt-0.5 text-xs text-gray-400">Seen</span>}
  </div>
);

export default MessageBubble;