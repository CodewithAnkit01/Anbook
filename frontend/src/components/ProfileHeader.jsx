
import { useRef, useState } from "react";

import { toast } from "react-toastify";

import {
  BadgeCheck,
  CalendarDays,
  Camera,
  Flag,
  Link2,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { startConversation } from "../services/messageService";

import {
  uploadCoverImage,
  uploadProfileImage,
} from "../services/userService";

import {
  fetchFollowers,
  fetchFollowing,
} from "../services/followService";

import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import FollowListModal from "./FollowListModal";
import ReportModal from "./ReportModal";

import getErrorMessage from "../utils/getErrorMessage";

import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "../utils/mediaRules";

import { usePresence } from "../context/PresenceContext";

// ==========================================
// WEBSITE HELPERS
// ==========================================

const isHttpLink = (url) =>
  /^https?:\/\//i.test(url);

const websiteLabel = (url) =>
  url
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");

// ==========================================
// PROFILE HEADER
// ==========================================

const ProfileHeader = ({
  profile,
  isOwner,
  onEdit,
  onImageChange,
  onFollowChange,
}) => {
  const [uploading, setUploading] = useState("");
  // "", "profile", or "cover"

  const [listModal, setListModal] = useState(null);
  // null, "followers", or "following"

  const [reportingUser, setReportingUser] = useState(false);

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const { isOnline } = usePresence();
  const navigate = useNavigate();

  // ==========================================
  // HANDLE IMAGE UPLOAD
  // ==========================================

  const handleFile = async (e, kind) => {
    const file = e.target.files?.[0];

    // Reset input so same file can be selected again
    e.target.value = "";

    if (!file) return;

    // ----------------------------------------
    // VALIDATE FILE TYPE
    // ----------------------------------------

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(
        "Only JPG, PNG and WebP images are allowed."
      );
      return;
    }

    // ----------------------------------------
    // VALIDATE FILE SIZE
    // ----------------------------------------

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(
        "Image must be smaller than 5 MB."
      );
      return;
    }

    setUploading(kind);

    try {
      // --------------------------------------
      // PROFILE IMAGE
      // --------------------------------------

      if (kind === "profile") {
        const data = await uploadProfileImage(file);

        onImageChange({
          profileImage: data.profileImage,
        });

        toast.success("Profile photo updated.");
      }

      // --------------------------------------
      // COVER IMAGE
      // --------------------------------------

      else {
        const data = await uploadCoverImage(file);

        onImageChange({
          coverImage: data.coverImage,
        });

        toast.success("Cover photo updated.");
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setUploading("");
    }
  };

  // ==========================================
  // START MESSAGE
  // ==========================================

  const handleMessage = async () => {
    try {
      const data = await startConversation(profile.id);

      navigate(
        `/messages/${data.conversation.id}`,
        {
          state: {
            otherUser: {
              id: profile.id,
              username: profile.username,
              profileImage: profile.profileImage,
              isVerified: profile.isVerified,
            },
          },
        }
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // ==========================================
  // JOINED DATE
  // ==========================================

  const joined = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(
        undefined,
        {
          month: "long",
          year: "numeric",
        }
      )
    : "Unknown";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">

      {/* ======================================
          COVER
      ====================================== */}

      <div className="relative h-36 bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 sm:h-48">

        {profile.coverImage && (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        )}

        {/* Cover upload loading */}

        {uploading === "cover" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </div>
        )}

        {/* Owner: change cover */}

        {isOwner && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              onChange={(e) =>
                handleFile(e, "cover")
              }
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                coverInputRef.current?.click()
              }
              disabled={Boolean(uploading)}
              aria-label="Change cover photo"
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/70 disabled:opacity-60"
            >
              <Camera className="h-4 w-4" />

              <span className="hidden sm:inline">
                Change cover
              </span>
            </button>
          </>
        )}
      </div>

      {/* ======================================
          PROFILE CONTENT
      ====================================== */}

      <div className="px-4 pb-5 sm:px-6">

        {/* ====================================
            AVATAR + ACTIONS
        ==================================== */}

        <div className="-mt-12 flex items-end justify-between">

          {/* Avatar */}

          <div className="relative">
            <Avatar
              user={profile}
              size="lg"
              className="ring-4 ring-white"
              online={isOnline(profile.id)}
            />

            {/* Profile image loading */}

            {uploading === "profile" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}

            {/* Owner: change profile image */}

            {isOwner && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  onChange={(e) =>
                    handleFile(e, "profile")
                  }
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    avatarInputRef.current?.click()
                  }
                  disabled={Boolean(uploading)}
                  aria-label="Change profile photo"
                  className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 text-gray-700 shadow ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* ==================================
              PROFILE ACTIONS
          ================================== */}

          <div className="mb-1">
            {isOwner ? (
              <div className="flex items-center gap-2">

                {/* Edit Profile */}

                <button
                  type="button"
                  onClick={onEdit}
                  className="flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit profile
                </button>

                {/* View My Reports */}

                <Link
                  to="/my-reports"
                  aria-label="View my reports"
                  className="flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <Flag className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    My Reports
                  </span>
                </Link>

              </div>
            ) : (

              // --------------------------------
              // OTHER USER
              // --------------------------------

              <div className="flex items-center gap-2">

                {/* Message */}

                <button
                  type="button"
                  onClick={handleMessage}
                  aria-label="Message"
                  className="rounded-full border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-50"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>

                {/* Report User */}

                <button
                  type="button"
                  onClick={() =>
                    setReportingUser(true)
                  }
                  aria-label="Report user"
                  className="rounded-full border border-gray-300 p-2 text-gray-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                >
                  <Flag className="h-4 w-4" />
                </button>

                {/* Follow */}

                <FollowButton
                  userId={profile.id}
                  initialFollowing={Boolean(
                    profile.isFollowing
                  )}
                  isFollowedByThem={Boolean(
                    profile.isFollowedByThem
                  )}
                  onChange={onFollowChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* ======================================
            USER INFORMATION
        ====================================== */}

        <div className="mt-3">

          {/* Username */}

          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-xl font-bold text-gray-900">
              {profile.username}
            </h1>

            {profile.isVerified && (
              <BadgeCheck className="h-5 w-5 shrink-0 text-indigo-500" />
            )}

            {isOnline(profile.id) && (
              <span className="ml-1 flex items-center gap-1 text-xs font-medium text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Active now
              </span>
            )}
          </div>

          {/* Bio */}

          {profile.bio && (
            <p className="mt-2 whitespace-pre-wrap break-words text-[15px] text-gray-700">
              {profile.bio}
            </p>
          )}

          {/* ====================================
              LOCATION / WEBSITE / JOINED
          ==================================== */}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">

            {/* Location */}

            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                {profile.location}
              </span>
            )}

            {/* Website */}

            {profile.website &&
              isHttpLink(profile.website) && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center gap-1.5 text-indigo-600 hover:underline"
                >
                  <Link2 className="h-4 w-4 shrink-0" />

                  <span className="break-all">
                    {websiteLabel(profile.website)}
                  </span>
                </a>
              )}

            {/* Joined */}

            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 shrink-0" />
              Joined {joined}
            </span>
          </div>

          {/* ====================================
              FOLLOWERS / FOLLOWING
          ==================================== */}

          <div className="mt-3 flex gap-5 text-sm">

            <button
              type="button"
              onClick={() =>
                setListModal("followers")
              }
              className="hover:underline"
            >
              <b className="text-gray-900">
                {profile.followerCount ?? 0}
              </b>{" "}
              <span className="text-gray-500">
                followers
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setListModal("following")
              }
              className="hover:underline"
            >
              <b className="text-gray-900">
                {profile.followingCount ?? 0}
              </b>{" "}
              <span className="text-gray-500">
                following
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================
          FOLLOWERS MODAL
      ======================================== */}

      {listModal === "followers" && (
        <FollowListModal
          title="Followers"
          propKey="followers"
          fetcher={() =>
            fetchFollowers(profile.id)
          }
          onClose={() =>
            setListModal(null)
          }
        />
      )}

      {/* ========================================
          FOLLOWING MODAL
      ======================================== */}

      {listModal === "following" && (
        <FollowListModal
          title="Following"
          propKey="following"
          fetcher={() =>
            fetchFollowing(profile.id)
          }
          onClose={() =>
            setListModal(null)
          }
        />
      )}

      {/* ========================================
          REPORT USER MODAL
      ======================================== */}

      {reportingUser && (
        <ReportModal
          targetType="USER"
          targetId={profile.id}
          onClose={() =>
            setReportingUser(false)
          }
        />
      )}
    </section>
  );
};

export default ProfileHeader;
