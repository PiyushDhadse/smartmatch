// app/login/page.js - UPDATED VERSION
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      console.log("DEBUG - Login attempt with:", { email, password });

      // Use the auth context login function
      const result = await login({ email, password });

      console.log("DEBUG - Login result:", result);

      if (!result.success) {
        throw new Error(result.error || result.message || "Login failed");
      }

      // Determine dashboard based on user type
      // Check both possible field names: userType and role
      const userData = result.data?.user || result.data;
      const userType = userData.userType || userData.role || userData.user_type;

      console.log("DEBUG - User data:", userData);
      console.log("DEBUG - User type:", userType);

      // Redirect based on user type
      // In your login page handleEmailLogin function:
      if (userType === "serviceProvider" || userType === "provider") {
        router.push("/dashboard/provider"); // Go directly to provider dashboard
      } else {
        router.push("/dashboard/customer"); // Go directly to customer dashboard
      }
    } catch (error) {
      console.error("DEBUG - Login catch error:", error);
      setError(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of the JSX remains the same ...
  return (
    <div className="min-h-[calc(100vh-160px)] bg-white-50 flex items-center justify-center py-12 px-5">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate mb-2">Welcome Back</h1>
          <p className="text-sage">Sign in to continue to your dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-cream">
          <form onSubmit={handleEmailLogin}>
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent text-slate placeholder-sage"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-forest hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-cream rounded-xl focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent text-slate placeholder-sage"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-emerald-700 text-white py-4 px-6 rounded-xl font-medium text-base transition-all duration-300 hover:bg-forest hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-cream"></div>
            <span className="text-sm text-sage">or</span>
            <div className="flex-1 h-px bg-cream"></div>
          </div>

          {/* Register Link */}
          <Link
            href="/register"
            className="w-full block text-center py-4 px-6 rounded-xl font-medium text-base transition-all duration-300 border-2 border-forest text-forest hover:bg-forest hover:text-white"
          >
            Create an Account
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-sage mt-6">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-forest hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-forest hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
