import { useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

import { updatePost } from "../services/postService";
import getErrorMessage from "../utils/getErrorMessage";
import { VISIBILITY_OPTIONS } from "../utils/visibility";

const MAX_CAPTION_LENGTH = 2000;

const EditPostForm = ({ post, onCancel, onSaved }) => {
  const [caption, setCaption] = useState(post.caption || "");
  const [visibility, setVisibility] = useState(post.visibility);
  const [saving, setSaving] = useState(false);

  const hasMedia = post.media?.length > 0;
  const trimmed = caption.trim();

  const captionChanged = trimmed !== (post.caption || "").trim();
  const visibilityChanged = visibility !== post.visibility;

  // A post needs text or media, same rule as your backend
  const canSave =
    (captionChanged || visibilityChanged) && (trimmed.length > 0 || hasMedia) && !saving;

  const handleSave = async () => {
    if (!canSave) return;

    // Send only what changed
    const changes = {};
    if (captionChanged) changes.caption = trimmed;
    if (visibilityChanged) changes.visibility = visibility;

    setSaving(true);
    try {
      const data = await updatePost(post.id, changes);
      toast.success("Post updated.");
      onSaved(data.post);
    } catch (error) {
      if (error.response?.status === 401) return;
      toast.error(getErrorMessage(error));
      setSaving(false);
    }
  };

  return (
    <div className="mt-3">
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={MAX_CAPTION_LENGTH}
        rows={4}
        autoFocus
        disabled={saving}
        aria-label="Edit caption"
        className="w-full resize-none rounded-xl bg-gray-50 p-3 text-[15px] text-gray-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
      />

      {hasMedia && (
        <p className="mt-1 text-xs text-gray-500">
          Photos and videos can't be changed after posting.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full bg-gray-100 p-0.5" role="group" aria-label="Who can see this post">
          {VISIBILITY_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setVisibility(value)}
              disabled={saving}
              aria-pressed={visibility === value}
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

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostForm;