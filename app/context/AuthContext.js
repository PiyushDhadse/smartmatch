// frontend/contexts/AuthContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/app/lib/api";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getProfile();

      // Your backend returns: { success, message, data: { ...user } }
      if (response.success && response.data) {
        setUser(response.data); // Set the user from response.data
      } else {
        throw new Error(response.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // If token is invalid (401), clear it
      if (error.response?.status === 401) {
        api.removeToken();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // In your AuthContext.js
  // In AuthContext.js, update the login function:
  const login = async (credentials) => {
  try {
    const response = await api.login(credentials);
    
    // Your backend returns: { success, message, data: { user, token } }
    if (response.success && response.data?.token) {
      api.setToken(response.data.token);
      setUser(response.data.user);  // Set user from response.data.user
      return { 
        success: true, 
        message: response.message,
        data: response.data 
      };
    } else {
      throw new Error(response.message || "Login failed");
    }
    
  } catch (error) {
    console.error("AuthContext login error:", error);
    
    let errorMessage = 'Login failed';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage,
      errors: error.response?.data?.errors || null
    };
  }
};

  const register = async (userData) => {
  try {
    const response = await api.register(userData);
    
    // Your backend returns: { success, message, data: { user } }
    if (response.success && response.data?.user) {
      // Note: Registration might not return a token
      if (response.data.token) {
        api.setToken(response.data.token);
      }
      setUser(response.data.user);
      return { 
        success: true, 
        message: response.message,
        data: response.data 
      };
    } else {
      throw new Error(response.message || "Registration failed");
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed';
    let validationErrors = null;
    
    if (error.response?.data) {
      errorMessage = error.response.data.message || errorMessage;
      validationErrors = error.response.data.errors || null;
    }
    
    return { 
      success: false, 
      error: errorMessage,
      errors: validationErrors,
      response: error.response?.data
    };
  }
};

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      api.removeToken();
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.updateProfile(data);
      setUser(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
