import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2, X } from "lucide-react";

import Avatar from "../Avatar";
import { fetchAdminReportById, updateAdminReportStatus } from "../../services/adminService";
import getErrorMessage from "../../utils/getErrorMessage";
import { timeAgo } from "../../utils/timeAgo";

// Only these three are valid targets for an admin action, matching validateReportStatus.
// PENDING isn't offered because the backend rejects reverting to it.
const ACTIONS = [
  { status: "REVIEWING", label: "Mark reviewing", style: "bg-blue-600 hover:bg-blue-700" },
  { status: "RESOLVED", label: "Resolve", style: "bg-green-600 hover:bg-green-700" },
  { status: "REJECTED", label: "Reject", style: "bg-gray-600 hover:bg-gray-700" },
];

const ReportDetailModal = ({ reportId, onClose, onUpdated }) => {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [actingStatus, setActingStatus] = useState(""); // which button is submitting

  useEffect(() => {
    let cancelled = false;
    fetchAdminReportById(reportId)
      .then((data) => !cancelled && setReport(data))
      .catch((err) => !cancelled && setError(getErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleAction = async (status) => {
    setActingStatus(status);
    try {
      const updated = await updateAdminReportStatus(reportId, status);
      setReport(updated);
      onUpdated(updated);
      toast.success(`Report marked as ${status.toLowerCase()}.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingStatus("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-up w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Report details</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!report && !error && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        {error && <p className="py-8 text-center text-sm text-gray-500">{error}</p>}

        {report && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar user={report.reporter} size="sm" />
              <div className="min-w-0">
                <Link
                  to={`/profile/${encodeURIComponent(report.reporter.username)}`}
                  className="text-sm font-semibold text-gray-900 hover:underline"
                >
                  {report.reporter.username}
                </Link>
                <p className="truncate text-xs text-gray-500">{report.reporter.email}</p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 text-sm">
                            <p>
                <b>Target:</b> {report.targetType}{" "}
                {report.targetType === "POST" && (
                  <Link to={`/post/${report.targetId}`} className="font-medium text-indigo-600 hover:underline">
                    View post →
                  </Link>
                )}
                {report.targetType === "COMMENT" && (
                  <span className="font-mono text-xs text-gray-500">{report.targetId}</span>
                )}
                {report.targetType === "USER" && (
                  <span className="font-mono text-xs text-gray-500">{report.targetId}</span>
                )}
              </p>
              <p className="mt-1"><b>Reason:</b> {report.reason.replaceAll("_", " ")}</p>
              {report.description && <p className="mt-1"><b>Details:</b> {report.description}</p>}
              <p className="mt-1"><b>Reported:</b> {timeAgo(report.createdAt)}</p>
              {report.reviewer && (
                <p className="mt-1">
                  <b>Reviewed by:</b> {report.reviewer.username} on{" "}
                  {new Date(report.reviewedAt).toLocaleString()}
                </p>
              )}
              <p className="mt-1"><b>Status:</b> {report.status}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {ACTIONS.map(({ status, label, style }) => (
                <button
                  key={status}
                  onClick={() => handleAction(status)}
                  disabled={Boolean(actingStatus) || report.status === status}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${style}`}
                >
                  {actingStatus === status && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailModal;