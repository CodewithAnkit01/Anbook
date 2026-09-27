import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Flag } from "lucide-react";
import ReportModal from "./ReportModal";

// Pass either (onEdit + onDelete) for the owner, or (targetId) for a viewer to report
const PostMenu = ({ onEdit, onDelete, targetId }) => {
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (action) => {
    setOpen(false);
    action();
  };

  const isOwnerMenu = Boolean(onEdit || onDelete);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Post options"
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-gray-200">
          {isOwnerMenu ? (
            <>
              <button role="menuitem" onClick={() => choose(onEdit)} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Pencil className="h-4 w-4" />
                Edit post
              </button>
              <button role="menuitem" onClick={() => choose(onDelete)} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                Delete post
              </button>
            </>
          ) : (
            <button role="menuitem" onClick={() => choose(() => setReporting(true))} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
              <Flag className="h-4 w-4" />
              Report post
            </button>
          )}
        </div>
      )}

      {reporting && (
        <ReportModal targetType="POST" targetId={targetId} onClose={() => setReporting(false)} />
      )}
    </div>
  );
};

export default PostMenu;