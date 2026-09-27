import { Bookmark as BookmarkIcon } from "lucide-react";

import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";
import { useInfinitePosts } from "../hooks/useInfinitePosts";
import { fetchBookmarks } from "../services/bookmarkService";

const Bookmarks = () => {
  const {
    posts,
    setPosts,
    page,
    hasNextPage,
    initialLoading,
    loadingMore,
    error,
    sentinelRef,
    loadPage,
  } = useInfinitePosts((pageNumber) => fetchBookmarks(pageNumber));

  const handleUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post))
    );
  };

  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  // Unsaving here should remove the card immediately, not just flip the icon
  const handleUnsaved = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <div className="space-y-4">
      <h1 className="px-1 text-xl font-bold text-gray-900">Saved posts</h1>

      {initialLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {!initialLoading && error && posts.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={() => loadPage(1)}
            className="mt-4 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Try again
          </button>
        </div>
      )}

      {!initialLoading && !error && posts.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
          <BookmarkIcon className="mx-auto h-10 w-10 text-gray-300" />
          <h2 className="mt-3 font-semibold text-gray-900">No saved posts yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tap the bookmark icon on a post to save it for later.
          </p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={{ ...post, isSaved: true }}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
          onUnsaved={handleUnsaved}
        />
      ))}

      {loadingMore && <PostSkeleton />}

      {error && posts.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => loadPage(page + 1)}
            className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Try again
          </button>
        </div>
      )}

      {hasNextPage && !error && <div ref={sentinelRef} className="h-1" />}

      {!hasNextPage && posts.length > 0 && !error && (
        <p className="py-4 text-center text-sm text-gray-400">No more saved posts.</p>
      )}
    </div>
  );
};

export default Bookmarks;