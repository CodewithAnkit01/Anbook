import { useEffect,useState } from "react";
import { toast } from "react-toastify";
import { BadgeCheck } from "lucide-react";
import LikeButton from "./LikeButton";
import Avatar from "./Avatar";
import MediaGrid from "./MediaGrid";
import PostMenu from "./PostMenu";
import EditPostForm from "./EditPostForm";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { deletePost } from "../services/postService";
import getErrorMessage from "../utils/getErrorMessage";
import { VISIBILITY } from "../utils/visibility";
import { timeAgo } from "../utils/timeAgo";
import {  MessageCircle } from "lucide-react";
import CommentSection from "./CommentSection";
import { getCommentCount } from "../services/commentService";
import { Link } from "react-router-dom";
import BookmarkButton from "./BookmarkButton";
// Highlights #hashtags using the same pattern as your backend (hashtag.js).
const renderCaption = (caption) =>
  caption.split(/(#[a-zA-Z0-9_]+)/g).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="font-medium text-indigo-600">
        {part}
      </span>
    ) : (
      part
    )
  );

const PostCard = ({ post, onUpdated, onDeleted, onUnsaved }) => {
  const { user: currentUser } = useAuth();
  const { user, caption, media, visibility, createdAt, updatedAt } = post;
  const profilePath = `/profile/${encodeURIComponent(user?.username ?? "")}`;
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
      const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);
  const isOwner = currentUser?.id === post.userId;
  const isEdited = new Date(updatedAt) - new Date(createdAt) > 1000;
  const visibilityInfo = VISIBILITY[visibility] || VISIBILITY.PUBLIC;
  const VisibilityIcon = visibilityInfo.icon;
const renderCaption = (caption) =>
  caption.split(/(#[a-zA-Z0-9_]+)/g).map((part, index) =>
    index % 2 === 1 ? (
      <Link
        key={index}
        to={`/hashtag/${encodeURIComponent(part.slice(1))}`}
        className="font-medium text-indigo-600 hover:underline"
      >
        {part}
      </Link>
    ) : (
      part
    )
  );
  
useEffect(() => {
  const loadCommentCount = async () => {
    try {
      const data = await getCommentCount(post.id);

      if (data.success) {
        setCommentCount(data.commentCount);
      }
    } catch (error) {
      console.error(
        "Failed to load comment count:",
        error
      );
    }
  };

  loadCommentCount();
}, [post.id]);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(post.id);
      toast.success("Post deleted.");
      onDeleted?.(post.id);
    } catch (error) {
      if (error.response?.status === 401) return;

      // Deleted somewhere else already: just remove it from the screen
      if (error.response?.status === 404) {
        toast.info("This post was already deleted.");
        onDeleted?.(post.id);
        return;
      }

      toast.error(getErrorMessage(error));
      setDeleting(false);
    }
  };

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
                    <Link to={profilePath} className="shrink-0">
            <Avatar user={user} size="md" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <Link to={profilePath} className="truncate font-semibold text-gray-900 hover:underline">
                {user?.username}
              </Link>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <time dateTime={createdAt} title={new Date(createdAt).toLocaleString()}>
                {timeAgo(createdAt)}
              </time>
              <span aria-hidden="true">·</span>
              <VisibilityIcon className="h-3.5 w-3.5" aria-label={visibilityInfo.label} />
              {isEdited && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Edited</span>
                </>
              )}
            </div>
          </div>
        </div>

                {!editing &&
          (isOwner ? (
            <PostMenu onEdit={() => setEditing(true)} onDelete={() => setConfirmingDelete(true)} />
          ) : (
            <PostMenu targetId={post.id} />
          ))}
      </header>

      {editing ? (
        <EditPostForm
          post={post}
          onCancel={() => setEditing(false)}
          onSaved={(updatedPost) => {
            onUpdated?.(updatedPost);
            setEditing(false);
          }}
        />
      ) : (
        caption && (
          <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-800">
            {renderCaption(caption)}
          </p>
        )
      )}

      <MediaGrid media={media} />
      <footer className="mt-3 flex items-center gap-1 border-t border-gray-100 pt-2">
        <LikeButton
          postId={post.id}
          initialLiked={Boolean(post.isLiked)}
          initialCount={post.likeCount ?? 0}
        />
        <button
          onClick={() => setShowComments((prev) => !prev)}
          aria-expanded={showComments}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
            showComments ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-100"
          }`}
          
        >
          <MessageCircle className="h-5 w-5" />
          Comment
          {commentCount > 0 && <span className="text-gray-500">· {commentCount}</span>}
        </button>

                <BookmarkButton
          postId={post.id}
          initialSaved={Boolean(post.isSaved)}
          onRemoved={onUnsaved}
        />
      </footer>

      {showComments && (
        <CommentSection
          postId={post.id}
          postOwnerId={post.userId}
          onCountChange={(delta) => setCommentCount((count) => Math.max(count + delta, 0))}
        />
      )}

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete this post?"
          message="This can't be undone. The post will be removed for everyone."
          confirmText="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </article>
  );
};

export default PostCard;