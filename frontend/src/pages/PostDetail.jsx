import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";
import { fetchPostById } from "../services/postService";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notFound | error
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchPostById(id)
      .then((data) => {
        if (cancelled) return;
        setPost(data.post);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        const status = error.response?.status;
        setStatus(status === 404 || status === 403 ? "notFound" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {status === "loading" && <PostSkeleton />}

      {status === "notFound" && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
          <h1 className="font-semibold text-gray-900">Post not available</h1>
          <p className="mt-1 text-sm text-gray-500">
            This post may have been deleted or you don't have permission to view it.
          </p>
          <Link
            to="/feed"
            className="mt-4 inline-block rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Back to feed
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-600">Couldn't load this post. Please try again.</p>
          <button
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}

      {status === "ready" && post && <PostCard post={post} />}
    </div>
  );
};

export default PostDetail;