"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const processed = useRef(false); // Prevents double-running in Strict Mode

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // If no session, try to exchange the code from the URL
      if (!session) {
        const code = new URL(window.location.href).searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Exchange error:", error.message);
            return router.push("/login?error=auth_failed");
          }
        }
      }

      // Now we definitely have a session (or we failed above)
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // FETCH ROLE from our public.users table
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          console.error("Profile fetch error:", profileError);
          return router.push("/unauthorized");
        }

        // ROLE-BASED REDIRECT
        if (profile.role === "provider" || profile.role === "serviceProvider") {
          router.push("/dashboard/provider");
        } else {
          router.push("/dashboard/customer");
        }
      } else {
        router.push("/login");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Syncing your profile...</p>
      </div>
    </div>
  );
}