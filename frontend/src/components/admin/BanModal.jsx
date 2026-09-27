import { useState } from "react";
import { toast } from "react-toastify";
import { Loader2, ShieldOff, X } from "lucide-react";

import { banAdminUser } from "../../services/adminService";
import getErrorMessage from "../../utils/getErrorMessage";

const MIN_LENGTH = 3;
const MAX_LENGTH = 300;

const BanModal = ({ user, onClose, onBanned }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= MIN_LENGTH && trimmed.length <= MAX_LENGTH && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const updated = await banAdminUser(user.id, trimmed);
      toast.success(`${user.username} has been banned.`);
      onBanned(updated);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-up w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ShieldOff className="h-5 w-5 text-red-500" />
            Ban {user.username}
          </h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="reason" className="mb-1.5 block text-sm font-medium text-gray-700">
              Reason (required, 3–300 characters)
            </label>
            <textarea
              id="reason"
              rows={3}
              maxLength={MAX_LENGTH}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              placeholder="Why is this account being banned?"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:opacity-60"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {trimmed.length}/{MAX_LENGTH}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Banning..." : "Ban user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BanModal;