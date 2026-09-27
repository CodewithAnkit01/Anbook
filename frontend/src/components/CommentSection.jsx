import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, RefreshCw } from "lucide-react";

import CommentForm from "./CommentForm";
import CommentThread from "./CommentThread";
import { fetchComments, createComment } from "../services/commentService";
import getErrorMessage from "../utils/getErrorMessage";

const CommentSection = ({ postId, postOwnerId, onCountChange }) => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const loadingRef = useRef(false);

  const load = useCallback(
    async (pageNumber) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      if (pageNumber === 1) setInitialLoading(true);
      else setLoadingMore(true);
      setError("");

      try {
        const data = await fetchComments(postId, pageNumber);
        setComments((prev) => {
          const ids = new Set(prev.map((comment) => comment.id));
          return [...prev, ...data.comments.filter((comment) => !ids.has(comment.id))];
        });
        setPage(pageNumber);
        setHasNext(data.pagination.hasNextPage);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        loadingRef.current = false;
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const handleCreate = async (text) => {
    try {
      const data = await createComment(postId, text);
      setComments((prev) => [data.comment, ...prev.filter((c) => c.id !== data.comment.id)]);
      onCountChange(1);
    } catch (err) {
      if (err.response?.status !== 401) toast.error(getErrorMessage(err));
      throw err;
    }
  };

  // The server's reply merges into the existing comment, so replyCount is kept
  const handleUpdated = (updated) => {
    setComments((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
  };

  const handleDeleted = (deleted, removedCount) => {
    setComments((prev) => prev.filter((c) => c.id !== deleted.id));
    onCountChange(-removedCount);
  };

  return (
    <section className="mt-3 border-t border-gray-100 pt-4" aria-label="Comments">
      <CommentForm onSubmit={handleCreate} placeholder="Write a comment..." />

      <div className="mt-4 space-y-4">
        {initialLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}

        {!initialLoading && error && comments.length === 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-500">{error}</p>
            <button
              onClick={() => load(1)}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {!initialLoading && !error && comments.length === 0 && (
          <p className="py-2 text-center text-sm text-gray-500">
            No comments yet. Be the first to comment.
          </p>
        )}

        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            postOwnerId={postOwnerId}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
            onCountChange={onCountChange}
          />
        ))}

        {hasNext && (
          <button
            onClick={() => load(page + 1)}
            disabled={loadingMore}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            View more comments
          </button>
        )}

        {error && comments.length > 0 && <p className="text-sm text-gray-500">{error}</p>}
      </div>
    </section>
  );
};

export default CommentSection;