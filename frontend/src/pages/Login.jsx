import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // HANDLE INPUT

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // HANDLE LOGIN

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Frontend validation
    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/users/login", formData);

      console.log("LOGIN RESPONSE:", response.data);

      // Save user + JWT through AuthContext
      login(response.data.user, response.data.token);

      // Redirect to recipes
      navigate("/recipes");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-linear-to-br from-orange-50 via-white to-orange-100 px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        {/* =====================================
            LEFT SIDE
        ====================================== */}
        <div className="hidden bg-linear-to-br from-orange-500 to-orange-700 p-10 text-white md:flex md:flex-col md:justify-center">
          <div className="max-w-md">
            {/* Icon */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
              🍳
            </div>

            <h1 className="text-4xl font-bold leading-tight">Welcome Back!</h1>

            <p className="mt-5 text-lg leading-8 text-orange-50">
              Login to your Recipe Sharing account and continue discovering,
              creating, and sharing delicious recipes.
            </p>

            {/* Features */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  ✓
                </span>
                <span>Discover amazing recipes</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  ✓
                </span>
                <span>Create and share recipes</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  ✓
                </span>
                <span>Connect with food lovers</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-6 sm:p-10 lg:p-12">
          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 md:mx-0">
              <FiLogIn size={25} />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>

            <p className="mt-2 text-gray-500">
              Login to continue to your account
            </p>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>

              <div className="relative">
                <FiMail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={19}
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline"
                  onClick={() =>
                    setError(
                      "Please contact the administrator to reset your password.",
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <FiLock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={19}
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-orange-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={19} /> : <FiEye size={19} />}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-orange-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Logging in...
                </>
              ) : (
                <>
                  <FiLogIn size={18} />
                  Login
                </>
              )}
            </button>
          </form>

          {/* REGISTER LINK */}
          <div className="mt-7 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-orange-600 transition hover:text-orange-700 hover:underline"
            >
              Create Account
            </Link>
          </div>

          {/* SECURITY TEXT */}
          <div className="mt-6 text-center text-xs text-gray-400">
            🔒 Your account information is securely protected.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
