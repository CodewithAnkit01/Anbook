import { useCallback, useEffect, useRef, useState } from "react";
import getErrorMessage from "../utils/getErrorMessage";

// fetchPage(pageNumber) must resolve to { posts, pagination: { hasNextPage } }
export const useInfinitePosts = (fetchPage) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const fetchRef = useRef(fetchPage);

  // Always call the latest fetchPage without re-triggering the effects below
  useEffect(() => {
    fetchRef.current = fetchPage;
  });

  const loadPage = useCallback(async (pageNumber) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (pageNumber === 1) setInitialLoading(true);
    else setLoadingMore(true);
    setError("");

    try {
      const data = await fetchRef.current(pageNumber);
      setPosts((prev) => {
        const ids = new Set(prev.map((post) => post.id));
        return [...prev, ...data.posts.filter((post) => !ids.has(post.id))];
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
    loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadPage(page + 1);
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, error, page, loadPage]);

  return {
    posts,
    setPosts,
    page,
    hasNextPage,
    initialLoading,
    loadingMore,
    error,
    sentinelRef,
    loadPage,
  };
};