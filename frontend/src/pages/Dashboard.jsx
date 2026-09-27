import { useAuth } from "../context/AuthContext";
import { getTokenExpiry } from "../utils/token";

const Dashboard = () => {
  const { user, token } = useAuth();
  const expiresAt = getTokenExpiry(token);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h1 className="text-xl font-bold text-gray-900">Temporary dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">
        Logged in as <b>{user?.username}</b> ({user?.email})
      </p>
      <p className="mt-1 text-xs text-gray-400">Role: {user?.role}</p>
      <p className="mt-1 text-xs text-gray-400">
        Session expires at: {expiresAt ? new Date(expiresAt).toLocaleTimeString() : "unknown"}
      </p>
    </div>
  );
};

export default Dashboard;