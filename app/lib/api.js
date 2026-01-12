// frontend/lib/api.js - COMPLETE VERSION
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
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
        const error = new Error(
          data.message || data.error || `HTTP error! status: ${response.status}`
        );
        error.response = { status: response.status, data };
        throw error;
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);

      // If error already has response data, re-throw it
      if (error.response) {
        throw error;
      }

      // Handle network errors or other fetch errors
      const apiError = new Error(error.message || "Network error");
      apiError.response = {
        status: error.response?.status || 0,
        data: { message: error.message || "Network error" },
      };
      throw apiError;
    }
  }

  // ========== AUTH METHODS ==========
  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
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
    return this.request("/auth/logout", {
      method: "POST",
    });
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
  // In your ApiService class
  async cancelBooking(id) {
    return this.request(`/bookings/${id}/cancel`, {
      method: "DELETE",
    });
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
