import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Bookmark } from "lucide-react";

import { bookmarkPost, removeBookmark } from "../services/bookmarkService";
import getErrorMessage from "../utils/getErrorMessage";

const BookmarkButton = ({ postId, initialSaved = false, onRemoved }) => {
  const [saved, setSaved] = useState(initialSaved);
  const busyRef = useRef(false);

  const handleToggle = async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    const wasSaved = saved;
    setSaved(!wasSaved);

    try {
      const data = wasSaved ? await removeBookmark(postId) : await bookmarkPost(postId);
      setSaved(data.isSaved);
      if (wasSaved && !data.isSaved) onRemoved?.(postId);
    } catch (error) {
      setSaved(wasSaved); // roll back
      if (error.response?.status !== 401) toast.error(getErrorMessage(error));
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved posts" : "Save post"}
      title={saved ? "Saved" : "Save"}
      className={`ml-auto rounded-full p-2 transition ${
        saved ? "text-indigo-600 hover:bg-indigo-50" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      <Bookmark className={`h-5 w-5 ${saved ? "fill-indigo-600" : ""}`} />
    </button>
  );
};

export default BookmarkButton;