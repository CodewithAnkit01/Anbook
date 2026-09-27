import { Link } from "react-router-dom";

const links = [
  { to: "/about", label: "About" },
  { to: "/help", label: "Help" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
];

const Footer = () => (
  <footer className="mt-8 border-t border-gray-200 bg-white/50 py-6">
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 text-xs text-gray-400 sm:flex-row sm:justify-between">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {links.map(({ to, label }) => (
          <Link key={to} to={to} className="hover:text-gray-600 hover:underline">
            {label}
          </Link>
        ))}
      </div>
      <p>© {new Date().getFullYear()} Anbook</p>
    </div>
  </footer>
);

export default Footer;