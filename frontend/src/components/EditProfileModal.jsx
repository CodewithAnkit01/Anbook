
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Link2,
  Loader2,
  MapPin,
  User,
  X,
  Flag,
} from "lucide-react";
import { Link } from "react-router-dom";

import FormField from "./FormField";

import { updateProfile } from "../services/userService";
import {
  MAX_BIO,
  normalizeWebsite,
  validateProfileEdit,
} from "../utils/validators";

import getErrorMessage from "../utils/getErrorMessage";

const EditProfileModal = ({
  profile,
  onClose,
  onSaved,
}) => {
  // ==========================================
  // INITIAL FORM DATA
  // ==========================================

  const [initial] = useState(() => ({
    username: profile.username || "",
    bio: profile.bio || "",
    website: profile.website || "",
    location: profile.location || "",
  }));

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ==========================================
  // ESCAPE KEY
  // ==========================================

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !saving) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [saving, onClose]);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ==========================================
  // HANDLE SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    const validationErrors =
      validateProfileEdit(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // ------------------------------------------
    // NORMALIZE DATA
    // ------------------------------------------

    const next = {
      username: form.username.trim(),
      bio: form.bio.trim(),
      website: normalizeWebsite(form.website),
      location: form.location.trim(),
    };

    // ------------------------------------------
    // FIND ONLY CHANGED FIELDS
    // ------------------------------------------

    const changes = {};

    Object.keys(next).forEach((key) => {
      const initialValue =
        typeof initial[key] === "string"
          ? initial[key].trim()
          : initial[key];

      if (next[key] !== initialValue) {
        changes[key] = next[key];
      }
    });

    // ------------------------------------------
    // NOTHING CHANGED
    // ------------------------------------------

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    // ------------------------------------------
    // UPDATE PROFILE
    // ------------------------------------------

    setSaving(true);

    try {
      const data = await updateProfile(changes);

      toast.success("Profile updated.");

      onSaved(data.user);
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(getErrorMessage(error));
      }

      setSaving(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={() => {
        if (!saving) {
          onClose();
        }
      }}
    >
      {/* ======================================
          MODAL
      ====================================== */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        onMouseDown={(e) => e.stopPropagation()}
        className="animate-fade-up max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        {/* ====================================
            HEADER
        ==================================== */}

        <div className="flex items-center justify-between">
          <h2
            id="edit-profile-title"
            className="text-lg font-semibold text-gray-900"
          >
            Edit profile
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ====================================
            FORM
        ==================================== */}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-5 space-y-4"
        >
          {/* Username */}

          <FormField
            label="Username"
            id="username"
            icon={User}
            type="text"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            error={errors.username}
            disabled={saving}
          />

          {/* Bio */}

          <div>
            <label
              htmlFor="bio"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Bio
            </label>

            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={MAX_BIO}
              value={form.bio}
              onChange={handleChange}
              disabled={saving}
              placeholder="Tell people about yourself"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white/70 p-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {form.bio.length}/{MAX_BIO}
            </p>
          </div>

          {/* Website */}

          <FormField
            label="Website"
            id="website"
            icon={Link2}
            type="text"
            placeholder="example.com"
            value={form.website}
            onChange={handleChange}
            error={errors.website}
            disabled={saving}
          />

          {/* Location */}

          <FormField
            label="Location"
            id="location"
            icon={MapPin}
            type="text"
            placeholder="Pokhara, Nepal"
            value={form.location}
            onChange={handleChange}
            error={errors.location}
            disabled={saving}
          />

          {/* ==================================
              FORM BUTTONS
          ================================== */}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

        {/* ====================================
            MY REPORTS
        ==================================== */}

        <div className="mt-5 border-t border-gray-100 pt-4">
          
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
