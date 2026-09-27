import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, Loader2, RefreshCw } from "lucide-react";

import ReportRow from "../../components/admin/ReportRow";
import ReportDetailModal from "../../components/admin/ReportDetailModal";
import { fetchAdminReports } from "../../services/adminService";
import getErrorMessage from "../../utils/getErrorMessage";

const STATUS_OPTIONS = ["", "PENDING", "REVIEWING", "RESOLVED", "REJECTED"];
const TARGET_OPTIONS = ["", "USER", "POST", "COMMENT"];

const AdminReports = () => {
  const [status, setStatus] = useState("");
  const [targetType, setTargetType] = useState("");
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const loadingRef = useRef(false);

  const load = useCallback(
    async (pageNumber) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      pageNumber === 1 ? setLoading(true) : setLoadingMore(true);
      setError("");

      try {
        const params = { page: pageNumber };
        if (status) params.status = status;
        if (targetType) params.targetType = targetType;

        const data = await fetchAdminReports(params);
        setReports((prev) => (pageNumber === 1 ? data.reports : [...prev, ...data.reports]));
        setPage(pageNumber);
        setHasNextPage(pageNumber < data.pagination.totalPages);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [status, targetType]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const handleUpdated = (updated) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s || "All statuses"}
            </option>
          ))}
        </select>

        <select
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
        >
          {TARGET_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t || "All target types"}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-200">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        {!loading && error && reports.length === 0 && (
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

        {!loading && !error && reports.length === 0 && (
          <div className="py-10 text-center">
            <Flag className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No reports match these filters.</p>
          </div>
        )}

        {reports.map((report) => (
          <ReportRow key={report.id} report={report} onOpen={setOpenId} />
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

      {openId && (
        <ReportDetailModal reportId={openId} onClose={() => setOpenId(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
};

export default AdminReports;