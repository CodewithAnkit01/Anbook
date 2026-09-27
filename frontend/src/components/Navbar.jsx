import { toast } from "react-toastify";
import { LogOut ,MessageCircle} from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // add useNavigate isn't needed, just Link + Bookmark icon below
import { Bookmark , Search} from "lucide-react";
import { ShieldCheck } from "lucide-react";
import NotificationBell from "./NotificationBell";

import Logo from "./Logo";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out.");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/" aria-label="Anbook home">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
                      <Link
            to={`/profile/${encodeURIComponent(user?.username ?? "")}`}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-gray-100"
          >
            <Avatar user={user} size="sm" />
            <span className="hidden text-sm font-medium text-gray-700 sm:block">
              {user?.username}
            </span>
          </Link>
                    <Link
            to="/messages"
            aria-label="Messages"
            title="Messages"
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            
            <MessageCircle className="h-5 w-5" />
          </Link>

                 <Link
            to="/search"
            aria-label="Search"
            title="Search"
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <Search className="h-5 w-5" />
          </Link>
           <NotificationBell />
                    <Link
            to="/bookmarks"
            aria-label="Saved posts"
            title="Saved posts"
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <Bookmark className="h-5 w-5" />
          </Link>

                    {["ADMIN", "SUPERADMIN"].includes(user?.role) && (
            <Link
              to="/admin"
              aria-label="Admin panel"
              title="Admin panel"
              className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <ShieldCheck className="h-5 w-5" />
            </Link>
          )}
             
                   
          </div>

          <button
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;