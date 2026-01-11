// frontend/contexts/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/app/lib/api';

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
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      api.removeToken();
    } finally {
      setLoading(false);
    }
  };

  // In your AuthContext.js
const login = async (credentials) => {
  try {
    console.log("DEBUG - AuthContext login called with:", credentials);
    const response = await api.login(credentials);
    
    console.log("DEBUG - Login API response:", response);
    
    // Handle different response formats
    if (response.token) {
      api.setToken(response.token);
      setUser(response.user || response.data);
      return { 
        success: true, 
        message: response.message,
        data: response 
      };
    } else if (response.data?.token) {
      api.setToken(response.data.token);
      setUser(response.data.user || response.data);
      return { 
        success: true, 
        message: response.message,
        data: response.data 
      };
    } else {
      throw new Error("Invalid login response format");
    }
    
  } catch (error) {
    console.error("AuthContext login error:", error);
    
    // Extract error details from the response
    let errorMessage = 'Login failed';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message && error.message !== "HTTP error! status: 401") {
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
    
    // If we get here, registration was successful
    if (response.token) {
      api.setToken(response.token);
    }
    
    setUser(response.user || response.data);
    return { 
      success: true, 
      message: response.message,
      data: response 
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Extract error details from the response
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
      console.error('Logout error:', error);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);