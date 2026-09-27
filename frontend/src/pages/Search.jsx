import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Search as SearchIcon, Users, Newspaper, Hash } from "lucide-react";

import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";
import UserResultItem from "../components/UserResultItem";
import HashtagResultItem from "../components/HashtagResultItem";
import { searchUsers, searchPosts, searchHashtags } from "../services/searchService";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import getErrorMessage from "../utils/getErrorMessage";

const TABS = [
  { key: "users", label: "Users", icon: Users, dataKey: "users" },
  { key: "posts", label: "Posts", icon: Newspaper, dataKey: "posts" },
  { key: "hashtags", label: "Hashtags", icon: Hash, dataKey: "hashtags" },
];
const FETCHERS = { users: searchUsers, posts: searchPosts, hashtags: searchHashtags };

const Search = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [tab, setTab] = useState("users");
  const debouncedQuery = useDebouncedValue(query.trim(), 400);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const requestId = useRef(0);
  const activeTab = TABS.find((t) => t.key === tab);

  // Keep the URL shareable, e.g. /search?q=anbook
  useEffect(() => {
    setParams(debouncedQuery ? { q: debouncedQuery } : {}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const load = async (pageNumber) => {
    if (!debouncedQuery) {
      setItems([]);
      setHasNextPage(false);
      return;
    }

    const thisRequest = ++requestId.current;
    pageNumber === 1 ? setLoading(true) : setLoadingMore(true);
    setError("");

    try {
      const data = await FETCHERS[tab](debouncedQuery, pageNumber);
      if (thisRequest !== requestId.current) return; // a newer search started meanwhile

      const results = data[activeTab.dataKey];
      setItems((prev) => (pageNumber === 1 ? results : [...prev, ...results]));
      setPage(pageNumber);
      setHasNextPage(data.pagination.hasNextPage);
    } catch (err) {
      if (thisRequest === requestId.current) setError(getErrorMessage(err));
    } finally {
      if (thisRequest === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, tab]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Anbook"
          aria-label="Search"
          className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="flex gap-2 rounded-full bg-gray-100 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition ${
              tab === key ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {!debouncedQuery && (
        <p className="py-10 text-center text-sm text-gray-400">
          Start typing to search {activeTab.label.toLowerCase()}.
        </p>
      )}

      {debouncedQuery && loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {debouncedQuery && !loading && error && items.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">{error}</p>
      )}

      {debouncedQuery && !loading && !error && items.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">
          No {tab} found for &quot;{debouncedQuery}&quot;.
        </p>
      )}

      <div className="space-y-3">
        {tab === "users" && items.map((user) => <UserResultItem key={user.id} user={user} />)}
        {tab === "hashtags" &&
          items.map((hashtag) => <HashtagResultItem key={hashtag.id} hashtag={hashtag} />)}
        {tab === "posts" && items.map((post) => <PostCard key={post.id} post={post} />)}
      </div>

      {loadingMore && <PostSkeleton />}

      {hasNextPage && !loading && (
        <button
          onClick={() => load(page + 1)}
          disabled={loadingMore}
          className="mx-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
          Load more
        </button>
      )}
    </div>
  );
};

export default Search;