import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { BadgeCheck, Loader2, ShieldCheck, ShieldOff, ShieldPlus, ShieldMinus } from "lucide-react";

import Avatar from "../Avatar";
import BanModal from "./BanModal";
import { useAuth } from "../../context/AuthContext";
import { unbanAdminUser, promoteToAdmin, demoteAdmin } from "../../services/adminService";
import getErrorMessage from "../../utils/getErrorMessage";

const ROLE_STYLES = {
  USER: "bg-gray-100 text-gray-600",
  ADMIN: "bg-indigo-100 text-indigo-700",
  SUPERADMIN: "bg-fuchsia-100 text-fuchsia-700",
};

const UserRow = ({ targetUser, onChanged }) => {
  const { user: me } = useAuth();
  const [banning, setBanning] = useState(false);
  const [busy, setBusy] = useState(false);

  const isSelf = targetUser.id === me.id;
  const isSuperadmin = targetUser.role === "SUPERADMIN";
  const iAmSuperadmin = me.role === "SUPERADMIN";

  // Mirrors banUser/unbanUser backend rules exactly
  const canBanToggle = !isSelf && !isSuperadmin && (targetUser.role !== "ADMIN" || iAmSuperadmin);
  // Mirrors createAdmin/deleteAdmin: SUPERADMIN-only actions
  const canPromote = iAmSuperadmin && targetUser.role === "USER" && !targetUser.isBanned;
  const canDemote = iAmSuperadmin && targetUser.role === "ADMIN";

  const handleUnban = async () => {
    setBusy(true);
    try {
      const updated = await unbanAdminUser(targetUser.id);
      toast.success(`${targetUser.username} has been unbanned.`);
      onChanged(updated);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handlePromote = async () => {
    setBusy(true);
    try {
      const updated = await promoteToAdmin(targetUser.id);
      toast.success(`${targetUser.username} promoted to ADMIN.`);
      onChanged(updated);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleDemote = async () => {
    setBusy(true);
    try {
      const updated = await demoteAdmin(targetUser.id);
      toast.success(`${targetUser.username} is no longer an ADMIN.`);
      onChanged(updated);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-3 hover:bg-gray-50">
      <Link to={`/profile/${encodeURIComponent(targetUser.username)}`} className="flex min-w-0 items-center gap-3">
        <Avatar user={targetUser} size="sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-gray-900">{targetUser.username}</span>
            {targetUser.isVerified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-indigo-500" />}
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_STYLES[targetUser.role]}`}>
              {targetUser.role}
            </span>
            {targetUser.isBanned && (
              <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                Banned
              </span>
            )}
          </div>
          <p className="truncate text-xs text-gray-500">{targetUser.email}</p>
          {targetUser.isBanned && targetUser.bannedReason && (
            <p className="mt-0.5 truncate text-xs text-red-500">Reason: {targetUser.bannedReason}</p>
          )}
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-1.5">
        {canBanToggle && (
          targetUser.isBanned ? (
            <button
              onClick={handleUnban}
              disabled={busy}
              className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              Unban
            </button>
          ) : (
            <button
              onClick={() => setBanning(true)}
              disabled={busy}
              className="flex items-center gap-1 rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <ShieldOff className="h-3.5 w-3.5" />
              Ban
            </button>
          )
        )}

        {canPromote && (
          <button
            onClick={handlePromote}
            disabled={busy}
            className="flex items-center gap-1 rounded-full border border-indigo-300 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
          >
            <ShieldPlus className="h-3.5 w-3.5" />
            Make admin
          </button>
        )}

        {canDemote && (
          <button
            onClick={handleDemote}
            disabled={busy}
            className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ShieldMinus className="h-3.5 w-3.5" />
            Remove admin
          </button>
        )}
      </div>

      {banning && (
        <BanModal
          user={targetUser}
          onClose={() => setBanning(false)}
          onBanned={(updated) => {
            onChanged(updated);
            setBanning(false);
          }}
        />
      )}
    </div>
  );
};

export default UserRow;