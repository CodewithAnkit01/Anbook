import { Link } from "react-router-dom";
import { Hash } from "lucide-react";

const HashtagResultItem = ({ hashtag }) => (
  <Link
    to={`/hashtag/${encodeURIComponent(hashtag.name)}`}
    className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
      <Hash className="h-5 w-5" />
    </span>
    <div className="min-w-0">
      <p className="truncate font-semibold text-gray-900">#{hashtag.name}</p>
      <p className="text-sm text-gray-500">
        {hashtag.postCount} {hashtag.postCount === 1 ? "post" : "posts"}
      </p>
    </div>
  </Link>
);

export default HashtagResultItem;