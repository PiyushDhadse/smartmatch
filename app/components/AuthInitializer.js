// frontend/components/AuthInitializer.js
"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/lib/api";

export function AuthInitializer() {
  const { clearAuthError } = useAuth();

  useEffect(() => {
    // Clear any stored auth errors on mount
    if (typeof window !== "undefined") {
      const storedError = sessionStorage.getItem("authError");
      if (storedError) {
        console.log("Clearing stored auth error:", storedError);
        sessionStorage.removeItem("authError");
      }

      // Check if we need to redirect after login
      const redirectUrl = sessionStorage.getItem("redirectUrl");
      if (redirectUrl && window.location.pathname === "/login") {
        console.log("Redirect URL found:", redirectUrl);
      }
    }

    // Validate token on app load
    const validateTokenOnLoad = async () => {
      if (api.isAuthenticated()) {
        try {
          await api.validateToken();
        } catch (error) {
          console.error("Initial token validation failed:", error);
        }
      }
    };

    validateTokenOnLoad();

    // Set up visibility change listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && api.isAuthenticated()) {
        // Validate token when user comes back to the tab
        api.validateToken().catch(console.error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearAuthError]);

  return null; // This component doesn't render anything
}
