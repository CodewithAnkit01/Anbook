import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, Loader2, RefreshCw } from "lucide-react";

import { fetchMyReports } from "../services/reportService";
import getErrorMessage from "../utils/getErrorMessage";
import { timeAgo } from "../utils/timeAgo";

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWING: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  REJECTED: "bg-gray-100 text-gray-600",
};

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const loadingRef = useRef(false);

  const load = useCallback(async (pageNumber) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    pageNumber === 1 ? setInitialLoading(true) : setLoadingMore(true);
    setError("");

    try {
      const data = await fetchMyReports(pageNumber);
      setReports((prev) => (pageNumber === 1 ? data.reports : [...prev, ...data.reports]));
      setPage(pageNumber);
      setHasNextPage(data.pagination.hasNextPage);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      loadingRef.current = false;
      setInitialLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  return (
    <div className="space-y-4">
      <h1 className="px-1 text-xl font-bold text-gray-900">My reports</h1>

      <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-200">
        {initialLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        {!initialLoading && error && reports.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={() => load(1)}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {!initialLoading && !error && reports.length === 0 && (
          <div className="py-10 text-center">
            <Flag className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">You haven't reported anything.</p>
          </div>
        )}

        {reports.map((report) => (
          <div key={report.id} className="flex items-start justify-between gap-3 border-b border-gray-100 px-3 py-3 last:border-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {report.targetType.charAt(0) + report.targetType.slice(1).toLowerCase()} · {report.reason.replaceAll("_", " ")}
              </p>
              {report.description && (
                <p className="mt-0.5 truncate text-sm text-gray-500">{report.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">{timeAgo(report.createdAt)}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[report.status]}`}>
              {report.status}
            </span>
          </div>
        ))}

        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}

        {hasNextPage && !error && (
          <button
            onClick={() => load(page + 1)}
            className="mx-auto block py-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
};

export default MyReports;