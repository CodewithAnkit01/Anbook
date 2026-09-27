import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RefreshCw, UserX } from "lucide-react";

import ProfileHeader from "../components/ProfileHeader";
import EditProfileModal from "../components/EditProfileModal";
import ProfilePosts from "../components/ProfilePosts";
import { useAuth } from "../context/AuthContext";
import { fetchProfile } from "../services/userService";

const ProfileSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
    <div className="h-36 bg-gray-200 sm:h-48" />
    <div className="px-6 pb-6">
      <div className="-mt-12 h-24 w-24 rounded-full bg-gray-300 ring-4 ring-white" />
      <div className="mt-4 h-5 w-40 rounded bg-gray-200" />
      <div className="mt-3 h-3 w-64 rounded bg-gray-100" />
    </div>
  </div>
);

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: me, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notFound | error
  const [editing, setEditing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchProfile(username)
      .then((data) => {
        if (cancelled) return;
        setProfile(data.user);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus(error.response?.status === 404 ? "notFound" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [username, reloadKey]);

  if (status === "loading") return <ProfileSkeleton />;

  if (status === "notFound") {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
        <UserX className="mx-auto h-10 w-10 text-gray-300" />
        <h1 className="mt-3 font-semibold text-gray-900">User not found</h1>
        <p className="mt-1 text-sm text-gray-500">This account doesn't exist or is unavailable.</p>
        <Link
          to="/feed"
          className="mt-4 inline-block rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
        >
          Back to feed
        </Link>
      </div>
    );
  }
    const handleFollowChange = (delta) => {
    setProfile((prev) => ({
      ...prev,
      followerCount: Math.max((prev.followerCount ?? 0) + delta, 0),
    }));
  };

  if (status === "error") {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
        <p className="text-sm text-gray-600">Couldn't load this profile. Please try again.</p>
        <button
          onClick={() => setReloadKey((key) => key + 1)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  const isOwner = me?.id === profile.id;

  // Photo changed: update this page and the logged-in user (navbar, localStorage)
  const handleImageChange = (changes) => {
    setProfile((prev) => ({ ...prev, ...changes }));
    updateUser(changes);
  };

  const handleSaved = (updatedUser) => {
    setProfile((prev) => ({ ...prev, ...updatedUser }));
    updateUser(updatedUser);
    setEditing(false);

    // The URL contains the username, so follow it if it changed
    if (updatedUser.username !== username) {
      navigate(`/profile/${encodeURIComponent(updatedUser.username)}`, { replace: true });
    }
  };

  return (
    <div className="space-y-4">
            <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        onEdit={() => setEditing(true)}
        onImageChange={handleImageChange}
        onFollowChange={handleFollowChange}
      />

      <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">Posts</h2>

      {/* key: switching to another profile starts a fresh list */}
      <ProfilePosts key={profile.id} userId={profile.id} isOwner={isOwner} />

      {editing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Profile;