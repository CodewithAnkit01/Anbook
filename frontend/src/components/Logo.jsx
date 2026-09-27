import { Users } from "lucide-react";

const Logo = ({ light = false }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
      <Users className="h-5 w-5 text-white" />
    </div>
    <span
      className={`text-2xl font-bold tracking-tight ${
        light ? "text-white" : "text-gray-900"
      }`}
    >
      Anbook
    </span>
  </div>
);

export default Logo;