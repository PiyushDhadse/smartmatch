// frontend/components/AuthErrorBoundary.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleAuthError = (event) => {
      if (event.detail?.includes("auth") || event.detail?.includes("User not found")) {
        setHasError(true);
        console.log("Auth error detected in boundary:", event.detail);
      }
    };

    // Listen for auth errors from API service
    window.addEventListener("authError", handleAuthError);
    
    return () => window.removeEventListener("authError", handleAuthError);
  }, []);

  useEffect(() => {
    // Reset error state when navigating
    setHasError(false);
  }, [router.pathname]);

  if (hasError && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-6">
            Your session has expired or you&apos;ve been logged out from another device.
          </p>
          <button
            onClick={() => {
              router.push("/login");
              setHasError(false);
            }}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return children;
}