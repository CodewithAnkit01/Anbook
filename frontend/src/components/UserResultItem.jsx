import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import Avatar from "./Avatar";

const UserResultItem = ({ user }) => (
  <Link
    to={`/profile/${encodeURIComponent(user.username)}`}
    className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
  >
    <Avatar user={user} size="md" />
    <div className="min-w-0">
      <div className="flex items-center gap-1">
        <span className="truncate font-semibold text-gray-900">{user.username}</span>
        {user.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-indigo-500" />}
      </div>
      {user.bio && <p className="truncate text-sm text-gray-500">{user.bio}</p>}
    </div>
  </Link>
);

export default UserResultItem;