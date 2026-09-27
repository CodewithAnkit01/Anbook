import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImagePlus, X, Loader2, Globe, Users, Lock } from "lucide-react";

import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { createPost } from "../services/postService";
import getErrorMessage from "../utils/getErrorMessage";
import { ALLOWED_MEDIA_TYPES, MAX_FILES, MAX_FILE_SIZE } from "../utils/mediaRules";

const VISIBILITY_OPTIONS = [
  { value: "PUBLIC", label: "Public", icon: Globe },
  { value: "FOLLOWERS", label: "Followers", icon: Users },
  { value: "PRIVATE", label: "Only me", icon: Lock },
];

const MAX_CAPTION_LENGTH = 2000; // UI limit only, your backend has none

const CreatePost = ({ onCreated }) => {
  const { user } = useAuth();

  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [files, setFiles] = useState([]); // [{ id, file, previewUrl, isVideo }]
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Free preview memory when the component goes away
  useEffect(() => {
    return () => filesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
  }, []);

  const canPost = (caption.trim().length > 0 || files.length > 0) && !submitting;

  const handleSelectFiles = (e) => {
    const selected = Array.from(e.target.files);
    e.target.value = ""; // lets the user pick the same file again later

    const accepted = [];
    for (const file of selected) {
      if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG, WebP, MP4 and WebM files are allowed.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is larger than 50 MB.`);
        continue;
      }
      accepted.push(file);
    }

    const room = Math.max(MAX_FILES - files.length, 0);
    if (accepted.length > room) {
      toast.error(`You can attach up to ${MAX_FILES} files per post.`);
    }

    const toAdd = accepted.slice(0, room).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
    }));

    if (toAdd.length > 0) setFiles((prev) => [...prev, ...toAdd]);
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const resetForm = () => {
    files.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setFiles([]);
    setCaption("");
    setVisibility("PUBLIC");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canPost) return;

    // Field names match your backend: caption, visibility, media
    const formData = new FormData();
    const text = caption.trim();
    if (text) formData.append("caption", text);
    formData.append("visibility", visibility);
    files.forEach((item) => formData.append("media", item.file));

    setSubmitting(true);
    setProgress(0);
    try {
      const data = await createPost(formData, setProgress);
      onCreated?.(data.post);
      resetForm();
      toast.success("Post published!");
    } catch (error) {
      // 401: AuthContext already logs the user out and shows its own message
      if (error.response?.status === 401) return;

      if (error.code === "ECONNABORTED") {
        // Don't auto-retry: the server may still have saved the post
        toast.warning(
          "The upload is taking too long. It may still have been posted, so check your feed before trying again."
        );
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
    >
      <div className="flex gap-3">
        <Avatar user={user} size="md" className="shrink-0" />
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={MAX_CAPTION_LENGTH}
          rows={3}
          disabled={submitting}
          placeholder={`What's on your mind, ${user?.username}?`}
          aria-label="Post caption"
          className="w-full resize-none rounded-xl bg-gray-50 p-3 text-[15px] text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
        />
      </div>

      {/* Previews */}
      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {files.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              {item.isVideo ? (
                <video src={item.previewUrl} muted preload="metadata" className="h-full w-full object-cover" />
              ) : (
                <img src={item.previewUrl} alt="Selected" className="h-full w-full object-cover" />
              )}
              {!submitting && (
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  aria-label="Remove file"
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {submitting && files.length > 0 && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {progress >= 100 ? "Processing your media..." : `Uploading ${progress}%`}
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_MEDIA_TYPES.join(",")}
            onChange={handleSelectFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting || files.length >= MAX_FILES}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            Photo/Video
            {files.length > 0 && (
              <span className="text-xs text-gray-400">
                {files.length}/{MAX_FILES}
              </span>
            )}
          </button>

          <div className="flex rounded-full bg-gray-100 p-0.5" role="group" aria-label="Who can see this post">
            {VISIBILITY_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setVisibility(value)}
                disabled={submitting}
                aria-pressed={visibility === value}
                title={label}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  visibility === value
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canPost}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
};

export default CreatePost;