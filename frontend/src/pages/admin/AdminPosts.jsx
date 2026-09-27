import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Newspaper, RefreshCw } from "lucide-react";

import AdminPostRow from "../../components/admin/AdminPostRow";
import { fetchAdminPosts } from "../../services/adminService";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import getErrorMessage from "../../utils/getErrorMessage";

const AdminPosts = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const loadingRef = useRef(false);

  const load = useCallback(
    async (pageNumber) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      pageNumber === 1 ? setLoading(true) : setLoadingMore(true);
      setError("");

      try {
        const params = { page: pageNumber };
        if (debouncedSearch) params.search = debouncedSearch;

        const data = await fetchAdminPosts(params);
        setPosts((prev) => (pageNumber === 1 ? data.posts : [...prev, ...data.posts]));
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
    [debouncedSearch]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const handleDeleted = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search post captions"
        className="w-full rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-400"
      />

      <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-200">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        {!loading && error && posts.length === 0 && (
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

        {!loading && !error && posts.length === 0 && (
          <div className="py-10 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No posts match this search.</p>
          </div>
        )}

        {posts.map((post) => (
          <AdminPostRow key={post.id} post={post} onDeleted={handleDeleted} />
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

export default AdminPosts;