"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export function AuthInitializer() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isDashboard = pathname.startsWith("/dashboard");
    const isLoginPage = pathname === "/login";
    const isHomePage = pathname === "/"; // Track the root URL

    // 1. Redirect to Login if unauthorized on dashboard
    if (isDashboard && !user) {
      router.push("/login");
      return;
    }

    // 2. Redirect to Dashboard if logged in and hitting Login or Home
    if ((isLoginPage || isHomePage) && user) {
      const target =
        user.role === "provider" || user.role === "serviceProvider"
          ? "/dashboard/provider"
          : "/dashboard/customer";

      console.log("Redirecting to:", target);
      router.push(target);
    }
  }, [user, loading, pathname, router]);

  return null;
}
