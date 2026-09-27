import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Loader2, X } from "lucide-react";

import Avatar from "./Avatar";
import getErrorMessage from "../utils/getErrorMessage";

// fetcher() must resolve to { total, [propKey]: [...] }, e.g. { total, followers }
const FollowListModal = ({ title, fetcher, propKey, onClose }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(getErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [fetcher]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const users = data?.[propKey] ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="follow-list-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-up flex max-h-[70vh] w-full max-w-sm flex-col rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 id="follow-list-title" className="font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-2">
          {!data && !error && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}

          {error && <p className="px-3 py-8 text-center text-sm text-gray-500">{error}</p>}

          {data && users.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-gray-500">Nobody here yet.</p>
          )}

          {users.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${encodeURIComponent(user.username)}`}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-50"
            >
              <Avatar user={user} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="truncate font-medium text-gray-900">{user.username}</span>
                  {user.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-indigo-500" />}
                </div>
                {user.bio && <p className="truncate text-xs text-gray-500">{user.bio}</p>}
              </div>
            </Link>
          ))}

          {data && data.total > users.length && (
            <p className="px-3 py-3 text-center text-xs text-gray-400">
              and {data.total - users.length} more
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;