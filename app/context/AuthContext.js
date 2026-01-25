"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/app/lib/api";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check authentication status
  const checkAuth = async () => {
    const token = api.getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getProfile();

      // Simple check - if response has user data
      if (response && (response.data || response.id)) {
        setUser(response.data || response);
        setAuthError(null);

        // Store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data || response),
          );
        }
      } else {
        // If no valid user data, clear token
        api.removeToken();
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      api.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();

    // Also check if user is stored in localStorage
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser && !user) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem("user");
        }
      }
    }
  }, [user]);

  // Login function - SIMPLIFIED
  const login = async (credentials) => {
    try {
      setAuthError(null);
      setLoading(true);

      const response = await api.login(credentials);

      // Handle different response formats
      if (response.success && response.data) {
        // Save token if exists
        if (response.data.token) {
          api.setToken(response.data.token);
        }

        // Set user
        const userData = response.data.user || response.data;
        setUser(userData);

        // Store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(userData));
        }

        return {
          success: true,
          message: response.message || "Login successful",
          data: response.data,
        };
      }

      // If response is the user object directly
      else if (response.id || response.email) {
        setUser(response);

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(response));
        }

        return {
          success: true,
          message: "Login successful",
          data: { user: response },
        };
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);

      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";

      setAuthError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function - SIMPLIFIED
  const register = async (userData) => {
    try {
      setAuthError(null);
      setLoading(true);

      const response = await api.register(userData);

      if (response.success) {
        // If token provided, save it
        if (response.data?.token) {
          api.setToken(response.data.token);
        }

        // Set user
        const userData = response.data?.user || response.data;
        if (userData) {
          setUser(userData);

          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(userData));
          }
        }

        return {
          success: true,
          message: response.message || "Registration successful",
          data: response.data,
        };
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);

      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";

      setAuthError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      api.removeToken();
      setUser(null);
      setAuthError(null);

      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
    }
  };

  // Update profile
  const updateProfile = async (data) => {
    try {
      const response = await api.updateProfile(data);

      if (response.success && response.data) {
        setUser(response.data);

        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Update failed",
      };
    }
  };

  const value = {
    user,
    loading,
    authError,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
