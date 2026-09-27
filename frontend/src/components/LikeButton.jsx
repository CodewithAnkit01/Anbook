import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Heart } from "lucide-react";

import LikesModal from "./LikesModal";
import { likePost, unlikePost } from "../services/likeService";
import getErrorMessage from "../utils/getErrorMessage";

const LikeButton = ({ postId, initialLiked = false, initialCount = 0 }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pop, setPop] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const busyRef = useRef(false);

  const handleToggle = async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    const wasLiked = liked;
    const previousCount = count;

    // Update the screen immediately
    setLiked(!wasLiked);
    setCount(previousCount + (wasLiked ? -1 : 1));
    if (!wasLiked) setPop(true);

    try {
      const data = wasLiked ? await unlikePost(postId) : await likePost(postId);
      // Trust the server's numbers (other people may have liked meanwhile)
      setLiked(data.isLiked);
      setCount(data.likeCount);
    } catch (error) {
      // Roll back
      setLiked(wasLiked);
      setCount(previousCount);
      setPop(false);
      // 401: AuthContext already logs the user out
      if (error.response?.status !== 401) toast.error(getErrorMessage(error));
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleToggle}
        aria-pressed={liked}
        aria-label={liked ? "Unlike this post" : "Like this post"}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
          liked ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <span
          className={`inline-flex ${pop ? "animate-like-pop" : ""}`}
          onAnimationEnd={() => setPop(false)}
        >
          <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
        </span>
        {liked ? "Liked" : "Like"}
      </button>

      {count > 0 && (
        <button
          onClick={() => setShowLikes(true)}
          className="rounded-full px-2 py-1.5 text-sm text-gray-500 hover:underline"
        >
          {count} {count === 1 ? "like" : "likes"}
        </button>
      )}

      {showLikes && <LikesModal postId={postId} onClose={() => setShowLikes(false)} />}
    </div>
  );
};

export default LikeButton;