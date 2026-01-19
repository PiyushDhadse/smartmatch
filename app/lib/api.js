// frontend/lib/api.js - UPDATED VERSION
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authErrorHandlers = [];
  }

  // frontend/lib/api.js - Update the request method
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

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type");
      let data = {};

      if (contentType && contentType.includes("application/json")) {
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          data = {
            message: `Invalid response from server (${response.status})`,
          };
        }
      } else {
        // If not JSON, try to get text
        const text = await response.text();
        data = { message: text || `HTTP error! status: ${response.status}` };
      }

      if (!response.ok) {
        // Enhanced auth error detection
        const authErrorMessages = [
          "User not found",
          "Invalid or expired token",
          "Please authenticate",
          "No token provided",
          "Authentication failed",
          "Unauthorized",
          "Forbidden",
        ];

        const isAuthError =
          response.status === 401 ||
          response.status === 403 ||
          authErrorMessages.some(
            (msg) =>
              data.message?.toLowerCase().includes(msg.toLowerCase()) ||
              data.error?.toLowerCase().includes(msg.toLowerCase()),
          );

        if (isAuthError) {
          console.log(`Auth error detected at ${endpoint}:`, {
            status: response.status,
            message: data.message,
            data: data,
          });

          // Special handling for specific endpoints
          if (endpoint.includes("/bookings") || endpoint.includes("/profile")) {
            // Store the endpoint that caused the auth error
            sessionStorage.setItem("authErrorEndpoint", endpoint);
          }

          this.handleAuthError(data.message || "Session expired");
        }

        // Create a more descriptive error
        const errorMessage =
          data.message ||
          data.error ||
          (isAuthError
            ? "Authentication required"
            : `HTTP error! status: ${response.status}`);

        const error = new Error(errorMessage);
        error.response = {
          status: response.status,
          data,
          isAuthError,
        };
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        isAuthError: error.response?.isAuthError,
      });

      // If error already has response data, re-throw it
      if (error.response) {
        throw error;
      }

      // Handle network errors or other fetch errors
      const apiError = new Error(error.message || "Network error");
      apiError.response = {
        status: error.response?.status || 0,
        data: { message: error.message || "Network error" },
        isAuthError: false,
      };
      throw apiError;
    }
  }
  // Add these methods to your existing ApiService class:

  async submitReview(reviewData) {
    return this.request("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  }

  async getProviderReviews(providerId, filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(
      `/reviews/provider/${providerId}${params ? `?${params}` : ""}`,
    );
  }

  async getUserReviews(type = "given") {
    return this.request(`/reviews/my?type=${type}`);
  }

  async addReviewResponse(reviewId, responseText) {
    return this.request(`/reviews/${reviewId}/response`, {
      method: "PUT",
      body: JSON.stringify({ response_text: responseText }),
    });
  }
  // Handle authentication errors
  handleAuthError(message = "Session expired") {
    console.log("Auth error detected, logging out...", message);

    this.removeToken();

    // Notify all registered handlers
    this.notifyAuthErrorHandlers(message);

    // Only redirect if we're in the browser
    if (typeof window !== "undefined") {
      // Don't redirect if we're already on auth pages
      const currentPath = window.location.pathname;
      const authPaths = ["/login", "/register", "/auth"];

      const shouldRedirect = !authPaths.some((path) =>
        currentPath.startsWith(path),
      );

      if (shouldRedirect) {
        // Store the current URL for redirecting back after login
        sessionStorage.setItem("redirectUrl", window.location.pathname);
        sessionStorage.setItem("authError", message);
        window.location.href = "/login";
      }
    }
  }

  // Register auth error handlers (for AuthContext)
  onAuthError(handler) {
    this.authErrorHandlers.push(handler);
  }

  // Remove auth error handler
  removeAuthErrorHandler(handler) {
    this.authErrorHandlers = this.authErrorHandlers.filter(
      (h) => h !== handler,
    );
  }

  // Notify all handlers
  notifyAuthErrorHandlers(message) {
    this.authErrorHandlers.forEach((handler) => handler(message));
  }

  // ========== AUTH METHODS ==========
  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getProfile() {
    return this.request("/auth/profile");
  }

  async updateProfile(data) {
    return this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async logout() {
    try {
      await this.request("/auth/logout", {
        method: "POST",
      });
    } finally {
      this.handleAuthError("Logged out");
    }
  }

  // ========== BOOKING METHODS ==========
  async getUserBookings(status = null) {
    const params = status ? `?status=${status}` : "";
    return this.request(`/bookings/my${params}`);
  }

  async getProviderBookings(status = null) {
    const params = status ? `?status=${status}` : "";
    return this.request(`/bookings/provider${params}`);
  }

  async updateBookingStatus(id, status) {
    return this.request(`/bookings/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async getBookingTracking(id) {
    return this.request(`/bookings/${id}/tracking`);
  }

  // In your ApiService class
  async cancelBooking(id) {
    return this.request(`/bookings/${id}/cancel`, {
      method: "DELETE",
    });
  }

  // ========== SERVICE METHODS ==========
  async getServices(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/services${params ? `?${params}` : ""}`);
  }

  async getServiceById(id) {
    return this.request(`/services/${id}`);
  }

  async createService(serviceData) {
    return this.request("/services", {
      method: "POST",
      body: JSON.stringify(serviceData),
    });
  }

  async getMyServices() {
    return this.request("/my/services");
  }

  async updateService(id, serviceData) {
    return this.request(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(id) {
    return this.request(`/services/${id}`, {
      method: "DELETE",
    });
  }

  // ========== TOKEN MANAGEMENT ==========
  setToken(token) {
    console.log(
      "🔐 Setting token in localStorage:",
      token ? token.substring(0, 20) + "..." : "null",
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      // Clear any auth errors from session storage
      sessionStorage.removeItem("authError");
    }
  }

  getToken() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      console.log(
        "🔍 Getting token from localStorage:",
        token ? token.substring(0, 20) + "..." : "null",
      );
      return token;
    }
    return null;
  }

  removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      // Also clear any user data from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("user_profile");
    }
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  // Add this helper method to validate token
  async validateToken() {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      if (
        error.response?.status === 401 ||
        error.response?.data?.message?.includes("User not found") ||
        error.response?.data?.message?.includes("Invalid or expired token")
      ) {
        this.handleAuthError(error.response.data.message);
        return false;
      }
      throw error;
    }
  }
}

export const api = new ApiService();
