// app/register/page.js
"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubRegister = async () => {
    if (!selectedRole) {
      alert("Please select a role to continue");
      return;
    }

    setIsLoading(true);
    // NextAuth GitHub login will be implemented here
    // Store role in session/database after auth
    // signIn('github', { callbackUrl: selectedRole === 'provider' ? '/dashboard/provider' : '/dashboard/user' });
    console.log("GitHub register clicked with role:", selectedRole);
  };

  const roles = [
    {
      id: "user",
      title: "Service Consumer",
      icon: "🏠",
      description: "Find and book local services",
      features: ["Browse services", "Book appointments", "Track status"],
    },
    {
      id: "provider",
      title: "Service Provider",
      icon: "🛠️",
      description: "Offer your services to customers",
      features: ["List your services", "Manage bookings", "Grow your business"],
    },
  ];

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-5">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-4xl">🔗</span>
            <span className="text-2xl font-bold text-slate">SmartMatch</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate mb-2">
            Join SmartMatch
          </h1>
          <p className="text-sage">Choose how you want to use SmartMatch</p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`relative bg-white rounded-2xl p-6 text-left transition-all duration-300 border-2 hover:shadow-lg ${
                selectedRole === role.id
                  ? "border-forest shadow-lg"
                  : "border-cream hover:border-sage"
              }`}
            >
              {/* Selected Indicator */}
              {selectedRole === role.id && (
                <span className="absolute top-4 right-4 w-6 h-6 bg-forest rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}

              <span className="text-4xl block mb-4">{role.icon}</span>
              <h3 className="text-xl font-semibold text-slate mb-2">
                {role.title}
              </h3>
              <p className="text-sm text-sage mb-4">{role.description}</p>

              <ul className="space-y-2">
                {role.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-slate"
                  >
                    <span className="w-1.5 h-1.5 bg-forest rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-cream">
          {/* GitHub Register Button */}
          <button
            onClick={handleGitHubRegister}
            disabled={isLoading || !selectedRole}
            className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-medium text-base transition-all duration-300 ${
              selectedRole
                ? "bg-slate text-white hover:bg-forest hover:-translate-y-0.5"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
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
                Creating account...
              </span>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {selectedRole
                  ? `Sign up as ${
                      selectedRole === "provider" ? "Provider" : "Consumer"
                    }`
                  : "Select a role to continue"}
              </>
            )}
          </button>

          {/* Helper Text */}
          {!selectedRole && (
            <p className="text-center text-sm text-sage mt-4">
              👆 Please select a role above to continue
            </p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-cream"></div>
            <span className="text-sm text-sage">already have an account?</span>
            <div className="flex-1 h-px bg-cream"></div>
          </div>

          {/* Login Link */}
          <Link
            href="/login"
            className="w-full block text-center py-4 px-6 rounded-xl font-medium text-base transition-all duration-300 border-2 border-forest text-forest hover:bg-forest hover:text-white"
          >
            Sign In Instead
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-sage mt-6">
          By creating an account, you agree to our{" "}
          <span className="text-forest cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-forest cursor-pointer hover:underline">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}
