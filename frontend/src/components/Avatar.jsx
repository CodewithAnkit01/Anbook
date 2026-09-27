const sizes = {
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-base",
  lg: "h-24 w-24 text-3xl",
};
const dotSizes = { sm: "h-2.5 w-2.5", md: "h-3 w-3", lg: "h-4 w-4" };

const Avatar = ({ user, size = "md", className = "", online = false }) => {
  const initial = user?.username?.charAt(0).toUpperCase() || "?";

  const inner = user?.profileImage ? (
    <img
      src={user.profileImage}
      alt={user.username}
      className={`rounded-full object-cover ${sizes[size]} ${className}`}
    />
  ) : (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-semibold text-white ${sizes[size]} ${className}`}
    >
      {initial}
    </div>
  );

  if (!online) return inner;

  return (
    <span className="relative inline-block">
      {inner}
      <span
        aria-label="Online"
        className={`absolute bottom-0 right-0 rounded-full border-2 border-white bg-green-500 ${dotSizes[size]}`}
      />
    </span>
  );
};

export default Avatar;