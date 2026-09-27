const PostSkeleton = () => (
  <div className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-full bg-gray-200" />
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-gray-200" />
        <div className="h-2.5 w-20 rounded bg-gray-100" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-3 w-full rounded bg-gray-200" />
      <div className="h-3 w-2/3 rounded bg-gray-200" />
    </div>
    <div className="mt-4 h-48 rounded-xl bg-gray-100" />
  </div>
);

export default PostSkeleton;