import { useEffect, useState } from "react";
import { Users, Newspaper, MessageSquare, Flag, ShieldOff, Loader2, RefreshCw } from "lucide-react";

import StatCard from "../../components/admin/StatCard";
import { fetchAdminDashboard } from "../../services/adminService";
import getErrorMessage from "../../utils/getErrorMessage";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    setStats(null);
    fetchAdminDashboard()
      .then(setStats)
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(load, []);

  if (!stats && !error) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={load}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatCard label="Total users" value={stats.totalUsers} icon={Users} tone="indigo" />
      <StatCard label="Total posts" value={stats.totalPosts} icon={Newspaper} tone="indigo" />
      <StatCard label="Total comments" value={stats.totalComments} icon={MessageSquare} tone="indigo" />
      <StatCard label="Pending reports" value={stats.pendingReports} icon={Flag} tone="red" />
      <StatCard label="Banned users" value={stats.bannedUsers} icon={ShieldOff} tone="gray" />
    </div>
  );
};

export default AdminDashboard;