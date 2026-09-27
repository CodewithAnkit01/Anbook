import { Link } from "react-router-dom";
import Avatar from "../Avatar";
import { timeAgo } from "../../utils/timeAgo";

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWING: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  REJECTED: "bg-gray-100 text-gray-600",
};

const ReportRow = ({ report, onOpen }) => (
  <button
    onClick={() => onOpen(report.id)}
    className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-gray-50"
  >
    <Avatar user={report.reporter} size="sm" className="shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-sm text-gray-900">
        <Link
          to={`/profile/${encodeURIComponent(report.reporter.username)}`}
          onClick={(e) => e.stopPropagation()}
          className="font-semibold hover:underline"
        >
          {report.reporter.username}
        </Link>{" "}
        reported a <span className="font-medium">{report.targetType.toLowerCase()}</span> ·{" "}
        {report.reason.replaceAll("_", " ")}
      </p>
      {report.description && (
        <p className="mt-0.5 truncate text-sm text-gray-500">{report.description}</p>
      )}
      <p className="mt-1 text-xs text-gray-400">{timeAgo(report.createdAt)}</p>
    </div>
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[report.status]}`}>
      {report.status}
    </span>
  </button>
);

export default ReportRow;