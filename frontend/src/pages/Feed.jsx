import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Newspaper, RefreshCw } from "lucide-react";

import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";
import { fetchFeed } from "../services/postService";
import getErrorMessage from "../utils/getErrorMessage";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0); // last page we loaded
  const [hasNextPage, setHasNextPage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const sentinelRef = useRef(null);
  const loadingRef = useRef(false); // stops two requests running at once
      // Your backend's update response has no `user`, so merge into the existing post
  const handleUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post))
    );
  };

  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };
  const loadPage = useCallback(async (pageNumber) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (pageNumber === 1) setInitialLoading(true);
    else setLoadingMore(true);
    setError("");

    try {
      const data = await fetchFeed(pageNumber);

      // Skip posts we already have. A new post shifts later pages, which
      // would otherwise show the same post twice.
      setPosts((prev) => {
        const existingIds = new Set(prev.map((post) => post.id));
        return [...prev, ...data.posts.filter((post) => !existingIds.has(post.id))];
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

  // First page
  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  // Infinite scroll: load the next page when the bottom marker is near the screen
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

  // A newly created post goes to the top of the feed
  const handleCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev.filter((post) => post.id !== newPost.id)]);
  };

  return (
    <div className="space-y-4">
      <CreatePost onCreated={handleCreated} />

      {initialLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {/* First load failed */}
      {!initialLoading && error && posts.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={() => loadPage(1)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}

      {/* Empty feed */}
      {!initialLoading && !error && posts.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
          <Newspaper className="mx-auto h-10 w-10 text-gray-300" />
          <h2 className="mt-3 font-semibold text-gray-900">Your feed is empty</h2>
          <p className="mt-1 text-sm text-gray-500">
            Share your first post above. Posts from people you follow will show up here too.
          </p>
        </div>
      )}

           {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      ))}

      {loadingMore && <PostSkeleton />}

      {/* Loading more failed */}
      {error && posts.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => loadPage(page + 1)}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <Loader2 className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}

      {hasNextPage && !error && <div ref={sentinelRef} className="h-1" />}

      {!hasNextPage && posts.length > 0 && !error && (
        <p className="py-4 text-center text-sm text-gray-400">You're all caught up.</p>
      )}
    </div>
  );
};

export default Feed;