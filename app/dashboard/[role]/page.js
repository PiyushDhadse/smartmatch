// app/dashboard/[role]/page.js - FIXED
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      // Still loading auth state, wait
      return;
    }

    if (!user) {
      // No user, redirect to login
      router.push("/login");
      return;
    }

    // User exists, redirect based on user type
    const userType = user.userType || user.user_type;

    if (userType === "serviceProvider") {
      router.push("/dashboard/provider");
    } else {
      router.push("/dashboard/customer");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
