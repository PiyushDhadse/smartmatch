// frontend/components/ProtectedRoute.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!api.isAuthenticated()) {
        router.push("/login");
        return;
      }

      try {
        const isValid = await api.validateToken();
        if (!isValid) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsValidating(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return children;
}
