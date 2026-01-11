// frontend/lib/api.js
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method - FIXED VERSION
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Return the data even for error statuses
      if (!response.ok) {
        // Create an error with the response data
        const error = new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
        error.response = { status: response.status, data };
        throw error;
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);

      // If it's already our custom error with response data, re-throw it
      if (error.response) {
        throw error;
      }

      // For network errors, create a consistent error format
      const apiError = new Error(error.message || "Network error");
      apiError.response = { status: 0, data: { message: error.message } };
      throw apiError;
    }
  }

  // Auth methods - NO CHANGES NEEDED
  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }
  // In your api.js file
  // In your ApiService class in api.js
  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }
  // ... rest of the methods remain the same ...

  // Token management
  setToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const api = new ApiService();
