
import { Link, useLocation } from "react-router-dom";
import { ShieldOff, Mail } from "lucide-react";

const SUPPORT_EMAIL = "support@anbook.com";

const BannedAccount = () => {
  const location = useLocation();

  const fromState = location.state;

  const fromStorage = (() => {
    try {
      return JSON.parse(
        sessionStorage.getItem("banReason") || "null"
      );
    } catch {
      return null;
    }
  })();

  const { reason, bannedAt } =
    fromState || fromStorage || {};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-gray-200">

        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <ShieldOff className="h-7 w-7 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="mt-4 text-xl font-bold text-gray-900">
          Your account has been suspended
        </h1>

        {/* Reason */}
        {reason && (
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Reason
            </p>

            <p className="mt-1 text-sm text-gray-800">
              {reason}
            </p>
          </div>
        )}

        {/* Banned Date */}
        {bannedAt && (
          <p className="mt-3 text-xs text-gray-400">
            Suspended on{" "}
            {new Date(bannedAt).toLocaleDateString(
              undefined,
              {
                dateStyle: "long",
              }
            )}
          </p>
        )}

        {/* Information */}
        <p className="mt-4 text-sm text-gray-600">
          If you believe this was a mistake, you can appeal
          by contacting our support team.
        </p>

        {/* Appeal */}
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=Account%20Appeal`}
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          <Mail className="h-4 w-4" />
          Appeal via {SUPPORT_EMAIL}
        </a>

        {/* Back to Login */}
        <Link
          to="/login"
          className="mt-4 block text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default BannedAccount;
