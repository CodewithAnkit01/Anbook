import { useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

const MAX_LENGTH = 2000;

const MessageComposer = ({ onSend, onTyping }) => {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const text = value.trim();
  const canSend = text.length > 0 && !sending;

  const submit = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      await onSend(text);
      setValue("");
      requestAnimationFrame(resize);
    } catch {
      // parent already showed the error toast, keep the text so nothing is lost
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-gray-100 bg-white p-3">
      <textarea
        ref={textareaRef}
        value={value}
                onChange={(e) => {
          setValue(e.target.value);
          resize();
          onTyping?.();
        }}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={MAX_LENGTH}
        disabled={sending}
        placeholder="Write a message..."
        aria-label="Message"
        className="max-h-32 flex-1 resize-none rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
      />
      <button
        onClick={submit}
        disabled={!canSend}
        aria-label="Send"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default MessageComposer;