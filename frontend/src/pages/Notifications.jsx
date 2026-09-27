import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Bell, Loader2, RefreshCw } from "lucide-react";

import NotificationItem from "../components/NotificationItem";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
} from "../services/notificationService";
import getErrorMessage from "../utils/getErrorMessage";

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const load = useCallback(async (pageNumber) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    pageNumber === 1 ? setInitialLoading(true) : setLoadingMore(true);
    setError("");

    try {
      const data = await fetchNotifications(pageNumber);
      setItems((prev) => {
        const ids = new Set(prev.map((n) => n.id));
        return [...prev, ...data.notifications.filter((n) => !ids.has(n.id))];
      });
      setPage(pageNumber);
      setHasNextPage(data.pagination.hasNextPage);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      loadingRef.current = false;
      setInitialLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || error) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && load(page + 1),
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, error, page, load]);

  const handleRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await markNotificationRead(id);
    } catch {
      // next visit will resync
    }
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsRead();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id) => {
    const previous = items;
    setItems((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNotification(id);
    } catch (error) {
      setItems(previous); // roll back
      if (error.response?.status !== 401) toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        {items.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAll}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-200">
        {initialLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        {!initialLoading && error && items.length === 0 && (
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

        {!initialLoading && !error && items.length === 0 && (
          <div className="py-10 text-center">
            <Bell className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">You're all caught up.</p>
          </div>
        )}

        {items.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={handleRead}
            onDelete={handleDelete}
          />
        ))}

        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}

        {error && items.length > 0 && (
          <p className="py-3 text-center text-sm text-gray-500">{error}</p>
        )}

        {hasNextPage && !error && <div ref={sentinelRef} className="h-1" />}
      </div>
    </div>
  );
};

export default Notifications;