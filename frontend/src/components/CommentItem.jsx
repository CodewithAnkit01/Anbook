import { useState } from "react";
import { toast } from "react-toastify";
import { BadgeCheck, Flag } from "lucide-react";
import { Link } from "react-router-dom";

import Avatar from "./Avatar";
import CommentForm from "./CommentForm";
import ConfirmDialog from "./ConfirmDialog";
import ReportModal from "./ReportModal";

import { useAuth } from "../context/AuthContext";
import {
  updateComment,
  deleteComment,
} from "../services/commentService";

import getErrorMessage from "../utils/getErrorMessage";
import { timeAgo } from "../utils/timeAgo";

const CommentItem = ({
  comment,
  postOwnerId,
  isReply = false,
  onReply,
  onUpdated,
  onDeleted,
}) => {
  const { user: currentUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reporting, setReporting] = useState(false);

  const isAuthor = currentUser?.id === comment.userId;

  const canDelete =
    isAuthor || currentUser?.id === postOwnerId;

  const isEdited =
    new Date(comment.updatedAt) -
      new Date(comment.createdAt) >
    1000;

  // ==========================================
  // UPDATE COMMENT
  // ==========================================

  const handleSave = async (text) => {
    try {
      const data = await updateComment(comment.id, text);

      onUpdated(data.comment);

      setEditing(false);
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(getErrorMessage(error));
      }

      // Tell CommentForm to keep the text
      throw error;
    }
  };

  // ==========================================
  // DELETE COMMENT
  // ==========================================

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const data = await deleteComment(comment.id);

      onDeleted(
        comment,
        data.removedCount ?? 1
      );

      setConfirming(false);
    } catch (error) {
      if (error.response?.status === 401) {
        setDeleting(false);
        return;
      }

      if (error.response?.status === 404) {
        toast.info("This comment was already deleted.");

        onDeleted(comment, 1);

        setConfirming(false);
        setDeleting(false);

        return;
      }

      toast.error(getErrorMessage(error));

      setDeleting(false);
    }
  };

  return (
    <div className="flex items-start gap-2">
      {/* ==========================================
          AVATAR
      ========================================== */}

      <Avatar
        user={comment.user}
        size="sm"
        className="shrink-0"
      />

      {/* ==========================================
          COMMENT CONTENT
      ========================================== */}

      <div className="min-w-0 flex-1">
        {editing ? (
          <CommentForm
            initialValue={comment.content}
            showAvatar={false}
            autoFocus
            onSubmit={handleSave}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="inline-block max-w-full rounded-2xl bg-gray-100 px-3 py-2">
            {/* Username + verified badge */}

            <div className="flex items-center gap-1">
              <Link
                to={`/profile/${encodeURIComponent(
                  comment.user?.username ?? ""
                )}`}
                className="truncate text-sm font-semibold text-gray-900 hover:underline"
              >
                {comment.user?.username}
              </Link>

              {comment.user?.isVerified && (
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
              )}
            </div>

            {/* Comment text */}

            <p className="whitespace-pre-wrap break-words text-sm text-gray-800">
              {comment.content}
            </p>
          </div>
        )}

        {/* ==========================================
            COMMENT ACTIONS
        ========================================== */}

        {!editing && (
          <div className="mt-1 flex items-center gap-3 px-2 text-xs text-gray-500">
            {/* Time */}

            <time
              dateTime={comment.createdAt}
              title={new Date(
                comment.createdAt
              ).toLocaleString()}
            >
              {timeAgo(comment.createdAt)}
            </time>

            {/* Edited */}

            {isEdited && <span>Edited</span>}

            {/* Reply */}

            {onReply && (
              <button
                type="button"
                onClick={onReply}
                className="font-medium hover:text-gray-800"
              >
                Reply
              </button>
            )}

            {/* Edit */}

            {isAuthor && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="font-medium hover:text-gray-800"
              >
                Edit
              </button>
            )}

            {/* Delete */}

            {canDelete && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="font-medium hover:text-red-600"
              >
                Delete
              </button>
            )}

            {/* Report */}

            {!isAuthor && (
              <button
                type="button"
                onClick={() => setReporting(true)}
                className="flex items-center gap-1 font-medium hover:text-red-600"
              >
                <Flag className="h-3 w-3" />
                Report
              </button>
            )}
          </div>
        )}
      </div>

      {/* ==========================================
          REPORT MODAL
      ========================================== */}

      {reporting && (
        <ReportModal
          targetType="COMMENT"
          targetId={comment.id}
          onClose={() => setReporting(false)}
        />
      )}

      {/* ==========================================
          DELETE CONFIRMATION
      ========================================== */}

      {confirming && (
        <ConfirmDialog
          title={
            isReply
              ? "Delete this reply?"
              : "Delete this comment?"
          }
          message={
            isReply
              ? "This can't be undone."
              : "This can't be undone. Any replies to it will be deleted too."
          }
          confirmText="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => {
            if (!deleting) {
              setConfirming(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default CommentItem;