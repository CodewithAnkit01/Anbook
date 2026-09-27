import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

import Avatar from "../Avatar";
import ConfirmDialog from "../ConfirmDialog";
import { deleteAdminComment } from "../../services/adminService";
import getErrorMessage from "../../utils/getErrorMessage";
import { timeAgo } from "../../utils/timeAgo";

const AdminCommentRow = ({ comment, onDeleted }) => {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdminComment(comment.id);
      toast.success("Comment deleted.");
      onDeleted(comment.id);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl px-3 py-3 hover:bg-gray-50">
      <div className="flex min-w-0 items-start gap-3">
        <Avatar user={comment.user} size="sm" className="shrink-0" />
        <div className="min-w-0">
          <Link
            to={`/profile/${encodeURIComponent(comment.user.username)}`}
            className="text-sm font-semibold text-gray-900 hover:underline"
          >
            {comment.user.username}
          </Link>
          {comment.parentId && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">reply</span>
          )}
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-700">{comment.content}</p>
                    <p className="mt-1 truncate text-xs text-gray-400">
            Post:{" "}
            <span className="italic">
              {comment.post?.caption ? `"${comment.post.caption}"` : "media post, no caption"}
            </span>
            {comment.post?.id && (
              <Link to={`/post/${comment.post.id}`} className="ml-2 font-medium text-indigo-600 hover:underline">
                View post →
              </Link>
            )}
            <span className="ml-2">· {timeAgo(comment.createdAt)}</span>
          </p>
        </div>
      </div>

      <button
        onClick={() => setConfirming(true)}
        aria-label="Delete comment"
        className="shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {confirming && (
        <ConfirmDialog
          title="Delete this comment?"
          message="This removes the comment for everyone. This can't be undone."
          confirmText="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
};

export default AdminCommentRow;