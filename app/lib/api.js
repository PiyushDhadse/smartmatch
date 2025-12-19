const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ==================== Auth APIs ====================

/**
 * Sync user with backend database
 */
export async function syncUser(userData) {
  return fetchAPI("/auth/sync-user", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Get current user profile
 */
export async function getProfile(userId) {
  return fetchAPI("/auth/profile", {
    headers: {
      "x-user-id": userId,
    },
  });
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  return fetchAPI("/auth/profile", {
    method: "PUT",
    headers: {
      "x-user-id": userId,
    },
    body: JSON.stringify(updates),
  });
}

/**
 * Register as a service provider
 */
export async function becomeProvider(userId, providerData) {
  return fetchAPI("/auth/become-provider", {
    method: "POST",
    headers: {
      "x-user-id": userId,
    },
    body: JSON.stringify(providerData),
  });
}

/**
 * Update provider availability status
 */
export async function updateAvailability(userId, availabilityStatus) {
  return fetchAPI("/auth/provider/availability", {
    method: "PATCH",
    headers: {
      "x-user-id": userId,
    },
    body: JSON.stringify({ availability_status: availabilityStatus }),
  });
}

/**
 * Get provider dashboard statistics
 */
export async function getProviderStats(userId) {
  return fetchAPI("/auth/provider/stats", {
    headers: {
      "x-user-id": userId,
    },
  });
}

// ==================== Services APIs ====================

/**
 * Get all services with optional filters
 * @param {Object} filters - Optional filters for services
 * @returns {Promise<Object>} Services response with data and pagination
 */
export async function getServices(filters = {}) {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
  }

  const queryString = params.toString();
  const endpoint = `/services${queryString ? `?${queryString}` : ""}`;

  const response = await fetchAPI(endpoint);

  // Transform response to consistent format
  return {
    success: response.success,
    data: response.services || [],
    count: response.count || 0,
    total: response.total || 0,
    page: response.page || 1,
    pages: response.pages || 1,
  };
}

/**
 * Get service by ID
 */
export async function getServiceById(id) {
  const response = await fetchAPI(`/services/${id}`);
  return {
    success: response.success,
    data: response.service,
  };
}

/**
 * Get all service categories
 */
export async function getCategories() {
  const response = await fetchAPI("/services/categories");
  return {
    success: response.success,
    data: response.categories || [],
    count: response.count || 0,
  };
}

/**
 * Get services by provider ID
 */
export async function getServicesByProvider(providerId) {
  const response = await fetchAPI(`/services/provider/${providerId}`);
  return {
    success: response.success,
    data: response.services || [],
    count: response.count || 0,
  };
}

/**
 * Create a new service (Provider only)
 */
export async function createService(userId, serviceData) {
  return fetchAPI("/services", {
    method: "POST",
    headers: {
      "x-user-id": userId,
    },
    body: JSON.stringify(serviceData),
  });
}

/**
 * Update a service (Provider only)
 */
export async function updateService(userId, id, updates) {
  return fetchAPI(`/services/${id}`, {
    method: "PUT",
    headers: {
      "x-user-id": userId,
    },
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a service (Provider only)
 */
export async function deleteService(userId, id) {
  return fetchAPI(`/services/${id}`, {
    method: "DELETE",
    headers: {
      "x-user-id": userId,
    },
  });
}

/**
 * Get provider's services
 */
export async function getMyServices(userId) {
  const response = await fetchAPI("/services/my-services", {
    headers: {
      "x-user-id": userId,
    },
  });
  return {
    success: response.success,
    data: response.services || [],
    count: response.count || 0,
  };
}

// ==================== Bookings APIs ====================

/**
 * Get available time slots for a service on a specific date
 */
export async function getAvailableSlots(serviceId, date) {
  const response = await fetchAPI(
    `/bookings/available-slots?service_id=${serviceId}&date=${date}`
  );
  return {
    success: response.success,
    data: response.available_slots || [],
    date: response.date,
  };
}

/**
 * Create a new booking
 */
export async function createBooking(userId, bookingData) {
  return fetchAPI("/bookings", {
    method: "POST",
    headers: {
      "x-user-id": userId,
    },
    body: JSON.stringify(bookingData),
  });
}

/**
 * Get user's bookings (as customer)
 */
export async function getMyBookings(userId, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append("status", params.status);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  const queryString = queryParams.toString();
  const endpoint = `/bookings/my-bookings${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetchAPI(endpoint, {
    headers: {
      "x-user-id": userId,
    },
  });

  return {
    success: response.success,
    data: response.bookings || [],
    count: response.count || 0,
    total: response.total || 0,
    page: response.page || 1,
    pages: response.pages || 1,
  };
}

/**
 * Get provider's bookings
 */
export async function getProviderBookings(userId, params = {}) {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append("status", params.status);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  const queryString = queryParams.toString();
  const endpoint = `/bookings/provider-bookings${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetchAPI(endpoint, {
    headers: {
      "x-user-id": userId,
    },
  });

  return {
    success: response.success,
    data: response.bookings || [],
    count: response.count || 0,
    total: response.total || 0,
    page: response.page || 1,
    pages: response.pages || 1,
  };
}

/**
 * Get booking by ID
 */
export async function getBookingById(userId, bookingId) {
  const response = await fetchAPI(`/bookings/${bookingId}`, {
    headers: {
      "x-user-id": userId,
    },
  });
  return {
    success: response.success,
    data: response.booking,
  };
}

/**
 * Get booking tracking/history
 */
export async function getBookingTracking(userId, bookingId) {
  const response = await fetchAPI(`/bookings/${bookingId}/tracking`, {
    headers: {
      "x-user-id": userId,
    },
  });
  return {
    success: response.success,
    data: response.tracking || [],
  };
}

/**
 * Update booking status (Provider only)
 */
export async function updateBookingStatus(
  userId,
  bookingId,
  status,
  notes = ""
) {
  return fetchAPI(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: {
      "x-user-id": userId,
    },
    body: JSON.stringify({
      status,
      provider_notes: notes,
    }),
  });
}

/**
 * Cancel booking (Customer)
 */
export async function cancelBooking(userId, bookingId, reason = "") {
  return fetchAPI(`/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: {
      "x-user-id": userId,
    },
    body: JSON.stringify({
      cancellation_reason: reason,
    }),
  });
}

// ==================== Default Export ====================

export default {
  // Auth
  syncUser,
  getProfile,
  updateProfile,
  becomeProvider,
  updateAvailability,
  getProviderStats,

  // Services
  getServices,
  getServiceById,
  getCategories,
  getServicesByProvider,
  createService,
  updateService,
  deleteService,
  getMyServices,

  // Bookings
  getAvailableSlots,
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  getBookingTracking,
  updateBookingStatus,
  cancelBooking,
};
