import { useState } from "react";
import { toast } from "react-toastify";
import { CornerDownRight, Loader2 } from "lucide-react";

import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { fetchReplies, createReply } from "../services/commentService";
import getErrorMessage from "../utils/getErrorMessage";

const CommentThread = ({ comment, postOwnerId, onUpdated, onDeleted, onCountChange }) => {
  const [replies, setReplies] = useState([]);
  const [replyCount, setReplyCount] = useState(comment.replyCount ?? 0);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyForm, setReplyForm] = useState(null); // null = closed, otherwise the prefilled text

  const loadReplies = async (pageNumber) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await fetchReplies(comment.id, pageNumber);
      setReplies((prev) => {
        const ids = new Set(prev.map((reply) => reply.id));
        return [...prev, ...data.replies.filter((reply) => !ids.has(reply.id))];
      });
      setPage(pageNumber);
      setHasNext(data.pagination.hasNextPage);
      setExpanded(true);
    } catch (error) {
      if (error.response?.status !== 401) toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReply = async (text) => {
    try {
      const data = await createReply(comment.id, text);
      setReplyCount((count) => count + 1);
      onCountChange(1);
      setReplyForm(null);

      if (expanded) {
        setReplies((prev) =>
          prev.some((reply) => reply.id === data.reply.id) ? prev : [...prev, data.reply]
        );
      } else {
        loadReplies(1);
      }
      toast.success("Reply posted.");
    } catch (error) {
      if (error.response?.status !== 401) toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const handleReplyUpdated = (updated) => {
    setReplies((prev) => prev.map((reply) => (reply.id === updated.id ? { ...reply, ...updated } : reply)));
  };

  const handleReplyDeleted = (deleted) => {
    setReplies((prev) => prev.filter((reply) => reply.id !== deleted.id));
    setReplyCount((count) => Math.max(count - 1, 0));
    onCountChange(-1);
  };

  return (
    <div>
      <CommentItem
        comment={comment}
        postOwnerId={postOwnerId}
        onReply={() => setReplyForm("")}
        onUpdated={onUpdated}
        onDeleted={onDeleted}
      />

      <div className="ml-11 mt-2 space-y-3">
        {!expanded && replyCount > 0 && (
          <button
            onClick={() => loadReplies(1)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CornerDownRight className="h-3.5 w-3.5" />
            )}
            View {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </button>
        )}

        {expanded &&
          replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postOwnerId={postOwnerId}
              isReply
              onReply={() => setReplyForm(`@${reply.user?.username} `)}
              onUpdated={handleReplyUpdated}
              onDeleted={handleReplyDeleted}
            />
          ))}

        {expanded && hasNext && (
          <button
            onClick={() => loadReplies(page + 1)}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            View more replies
          </button>
        )}

        {replyForm !== null && (
          <CommentForm
            key={replyForm}
            initialValue={replyForm}
            placeholder="Write a reply..."
            autoFocus
            onSubmit={handleCreateReply}
            onCancel={() => setReplyForm(null)}
          />
        )}
      </div>
    </div>
  );
};

export default CommentThread;