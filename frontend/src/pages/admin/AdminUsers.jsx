import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Users as UsersIcon } from "lucide-react";

import UserRow from "../../components/admin/UserRow";
import { fetchAdminUsers } from "../../services/adminService";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import getErrorMessage from "../../utils/getErrorMessage";

const ROLE_OPTIONS = ["", "USER", "ADMIN", "SUPERADMIN"];
const BAN_OPTIONS = [
  { value: "", label: "All" },
  { value: "false", label: "Not banned" },
  { value: "true", label: "Banned" },
];

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isBanned, setIsBanned] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const [users, setUsers] = useState([]);
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
        if (role) params.role = role;
        if (isBanned) params.isBanned = isBanned;

        const data = await fetchAdminUsers(params);
        setUsers((prev) => (pageNumber === 1 ? data.users : [...prev, ...data.users]));
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
    [debouncedSearch, role, isBanned]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const handleChanged = (updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search username or email"
          className="min-w-[200px] flex-1 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-400"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r || "All roles"}
            </option>
          ))}
        </select>
        <select
          value={isBanned}
          onChange={(e) => setIsBanned(e.target.value)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-indigo-400"
        >
          {BAN_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
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

        {!loading && error && users.length === 0 && (
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

        {!loading && !error && users.length === 0 && (
          <div className="py-10 text-center">
            <UsersIcon className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No users match these filters.</p>
          </div>
        )}

        {users.map((u) => (
          <UserRow key={u.id} targetUser={u} onChanged={handleChanged} />
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

export default AdminUsers;