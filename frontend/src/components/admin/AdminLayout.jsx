import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Flag, Users, Newspaper, MessageSquare } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/reports", label: "Reports", icon: Flag },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/posts", label: "Posts", icon: Newspaper },
  { to: "/admin/comments", label: "Comments", icon: MessageSquare },
];

const AdminLayout = () => (
  <div className="space-y-4">
    <div>
      <h1 className="px-1 text-xl font-bold text-gray-900">Admin panel</h1>
      <div className="mt-3 flex gap-2 overflow-x-auto rounded-full bg-gray-100 p-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </div>
    <Outlet />
  </div>
);

export default AdminLayout;