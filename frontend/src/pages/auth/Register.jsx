import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Users } from "lucide-react";

import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/authService";
import { validateRegister, PASSWORD_HINT } from "../../utils/validators";
import getErrorMessage from "../../utils/getErrorMessage";

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuth();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Already logged in? No need to see the register page.
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear this field's error as the user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const validationErrors = validateRegister(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setAuth(data.token, data.user);
      toast.success(`Welcome to Anbook, ${data.user.username}!`);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Brand panel: desktop only */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Users className="h-8 w-8" />
          Anbook
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Share moments.
            <br />
            Connect with people.
          </h2>
          <p className="mt-4 max-w-md text-indigo-100">
            Join Anbook to follow friends, post your stories and be part of the
            conversation.
          </p>
        </div>
        <p className="text-sm text-indigo-200">© {new Date().getFullYear()} Anbook</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-2 text-2xl font-bold text-indigo-600 lg:hidden">
            <Users className="h-7 w-7" />
            Anbook
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-1 text-sm text-gray-500">
              It only takes a minute to get started.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <FormField
                label="Username"
                id="username"
                icon={User}
                type="text"
                autoComplete="username"
                placeholder="test"
                value={form.username}
                onChange={handleChange}
                error={errors.username}
                disabled={loading}
              />

              <FormField
                label="Email"
                id="email"
                icon={Mail}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                disabled={loading}
              />

              <FormField
                label="Password"
                id="password"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                hint={PASSWORD_HINT}
                disabled={loading}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;