import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];

const AdminRoute = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!ADMIN_ROLES.includes(user?.role)) return <Navigate to="/feed" replace />;

  return <Outlet />;
};

export default AdminRoute;