import { Newspaper, RefreshCw } from "lucide-react";

import PostCard from "./PostCard";
import PostSkeleton from "./PostSkeleton";
import { useInfinitePosts } from "../hooks/useInfinitePosts";
import { fetchUserPosts } from "../services/postService";

const ProfilePosts = ({ userId, isOwner }) => {
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
  } = useInfinitePosts((pageNumber) => fetchUserPosts(userId, pageNumber));

  // The update response has no `user`, so merge into the existing post
  const handleUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post))
    );
  };

  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <div className="space-y-4">
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
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}

      {!initialLoading && !error && posts.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
          <Newspaper className="mx-auto h-10 w-10 text-gray-300" />
          <h2 className="mt-3 font-semibold text-gray-900">
            {isOwner ? "You haven't posted yet" : "No posts to show"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isOwner
              ? "Your posts will appear here."
              : "Posts you're allowed to see will appear here."}
          </p>
        </div>
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} onUpdated={handleUpdated} onDeleted={handleDeleted} />
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
        <p className="py-4 text-center text-sm text-gray-400">No more posts.</p>
      )}
    </div>
  );
};

export default ProfilePosts;