import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2, Trash2 } from "lucide-react";

import Avatar from "../Avatar";
import ConfirmDialog from "../ConfirmDialog";
import { deleteAdminPost } from "../../services/adminService";
import getErrorMessage from "../../utils/getErrorMessage";
import { timeAgo } from "../../utils/timeAgo";

const AdminPostRow = ({ post, onDeleted }) => {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdminPost(post.id);
      toast.success("Post deleted.");
      onDeleted(post.id);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl px-3 py-3 hover:bg-gray-50">
      <div className="flex min-w-0 items-start gap-3">
        <Avatar user={post.user} size="sm" className="shrink-0" />
        <div className="min-w-0">
          <Link
            to={`/profile/${encodeURIComponent(post.user.username)}`}
            className="text-sm font-semibold text-gray-900 hover:underline"
          >
            {post.user.username}
          </Link>
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-700">
            {post.caption || <span className="italic text-gray-400">No caption</span>}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {timeAgo(post.createdAt)}
            <Link to={`/post/${post.id}`} className="ml-2 font-medium text-indigo-600 hover:underline">
              View post
            </Link>
          </p>
        </div>
      </div>

      <button
        onClick={() => setConfirming(true)}
        aria-label="Delete post"
        className="shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {confirming && (
        <ConfirmDialog
          title="Delete this post?"
          message="This removes the post for everyone. This can't be undone."
          confirmText="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
};

export default AdminPostRow;