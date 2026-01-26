"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          await handleUserSession(session);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setLoading(false);
      }
    };

    // 2. Helper to sync Auth User with Public Profile
    const handleUserSession = async (session) => {
      const { user: authUser } = session;

      try {
        // Try to get profile from 'users' table
        let { data: profile, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (!profile) {
          console.log("Creating missing profile for:", authUser.email);
          // If profile is missing, create it on the fly
          // Use the role from metadata if it exists!
          const { data: newProfile } = await supabase
            .from("users")
            .insert([
              {
                id: authUser.id,
                email: authUser.email,
                role: authUser.user_metadata?.role || "customer",
                name: authUser.user_metadata?.full_name || "New User",
              },
            ])
            .select()
            .single();
          profile = newProfile;
        }

        // SET USER WITH GUARANTEED ROLE
        setUser({
          ...authUser,
          ...profile,
          role: profile?.role || "customer",
        });
      } catch (err) {
        console.error("Session sync error:", err);
        // Fallback so the app doesn't crash/unauthorize
        setUser({ ...authUser, role: "customer" });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 3. Listen for changes (Sign-in/out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      if (session) {
        await handleUserSession(session);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // The onAuthStateChange listener in your context
      // will handle the profile fetching and redirection.
      return { success: true, data };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  // Make sure to include it in the Provider value:
  // value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}
  const signUp = async ({ email, password, name, userType, services }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // We provide both common naming conventions to avoid trigger errors
          data: {
            name: name,
            full_name: name,
            role: userType === "serviceProvider" ? "provider" : "customer",
            user_role: userType === "serviceProvider" ? "provider" : "customer",
          },
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signOut: () => supabase.auth.signOut() }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
