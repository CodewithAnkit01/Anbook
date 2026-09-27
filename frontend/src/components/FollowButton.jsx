import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, UserCheck, UserPlus } from "lucide-react";

import { followUser, unfollowUser } from "../services/followService";
import getErrorMessage from "../utils/getErrorMessage";

const FollowButton = ({ userId, initialFollowing = false, isFollowedByThem = false, onChange }) => {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const busyRef = useRef(false);

  const handleClick = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);

    const wasFollowing = following;
    setFollowing(!wasFollowing);

    try {
      const data = wasFollowing ? await unfollowUser(userId) : await followUser(userId);
      setFollowing(data.isFollowing);
      onChange?.(wasFollowing ? -1 : 1);
    } catch (error) {
      setFollowing(wasFollowing);
      if (error.response?.status !== 401) toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      busyRef.current = false;
    }
  };

  // "Follow Back" only when I don't follow them yet, but they already follow me
  const label = following ? "Following" : isFollowedByThem ? "Follow Back" : "Follow";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-pressed={following}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition disabled:opacity-60 ${
        following
          ? "border border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          : "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:brightness-110"
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <UserCheck className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {label}
    </button>
  );
};

export default FollowButton;