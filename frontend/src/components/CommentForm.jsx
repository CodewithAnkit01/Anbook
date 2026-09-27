import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";

const MAX_LENGTH = 500; // same limit as your backend

// onSubmit(text) must return a promise. If it throws, the text is kept.
const CommentForm = ({
  initialValue = "",
  placeholder = "Write a comment...",
  onSubmit,
  onCancel,
  autoFocus = false,
  showAvatar = true,
}) => {
  const { user } = useAuth();
  const [value, setValue] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (autoFocus) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
    resize();
  }, [autoFocus]);

  const text = value.trim();
  // Must have text, and must differ from what we started with (edit / @mention prefill)
  const canSubmit = text.length > 0 && text !== initialValue.trim() && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(text);
      setValue("");
      requestAnimationFrame(resize);
    } catch {
      // the parent already showed an error toast, keep the text so nothing is lost
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // isComposing: don't send while an input method (e.g. Nepali typing) is composing
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape" && onCancel) onCancel();
  };

  return (
    <div className="flex items-start gap-2">
      {showAvatar && <Avatar user={user} size="sm" className="shrink-0" />}

      <div className="min-w-0 flex-1">
        <div className="flex items-end gap-2 rounded-2xl bg-gray-100 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-200">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              resize();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={MAX_LENGTH}
            disabled={submitting}
            placeholder={placeholder}
            aria-label={placeholder}
            className="max-h-36 w-full resize-none bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            aria-label="Send"
            className="shrink-0 rounded-full p-1.5 text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>

        {(onCancel || value.length >= 400) && (
          <div className="mt-1 flex items-center justify-between px-1 text-xs text-gray-400">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="font-medium text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
            ) : (
              <span />
            )}
            {value.length >= 400 && (
              <span>
                {value.length}/{MAX_LENGTH}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentForm;