const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
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
  return fetchAPI('/auth/sync-user', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

/**
 * Get current user profile
 */
export async function getProfile(token) {
  return fetchAPI('/auth/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Update user profile
 */
export async function updateProfile(token, updates) {
  return fetchAPI('/auth/profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
}

/**
 * Register as a service provider
 */
export async function becomeProvider(token) {
  return fetchAPI('/auth/become-provider', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ==================== Services APIs ====================

/**
 * Get all services with optional filters
 * @param {Object} filters - Optional filters for services
 * @returns {Promise<Object>} Services response with data and pagination
 */
export async function getServices(filters) {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }

  const queryString = params.toString();
  const endpoint = `/services${queryString ? `?${queryString}` : ''}`;
  
  return fetchAPI(endpoint);
}

/**
 * Get service by ID
 */
export async function getServiceById(id) {
  return fetchAPI(`/services/${id}`);
}

/**
 * Get all service categories
 */
export async function getCategories() {
  return fetchAPI('/services/categories');
}

/**
 * Create a new service (Provider only)
 */
export async function createService(token, serviceData) {
  return fetchAPI('/services', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(serviceData),
  });
}

/**
 * Update a service (Provider only)
 */
export async function updateService(token, id, updates) {
  return fetchAPI(`/services/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
}

/**
 * Delete a service (Provider only)
 */
export async function deleteService(token, id) {
  return fetchAPI(`/services/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get provider's services
 */
export async function getMyServices(token) {
  return fetchAPI('/services/my-services', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ==================== Bookings APIs ====================

/**
 * Create a new booking
 */
export async function createBooking(token, bookingData) {
  return fetchAPI('/bookings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bookingData),
  });
}

/**
 * Get user's bookings
 */
export async function getMyBookings(token) {
  return fetchAPI('/bookings/my-bookings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get provider's bookings
 */
export async function getProviderBookings(token) {
  return fetchAPI('/bookings/provider-bookings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Update booking status (Provider only)
 */
export async function updateBookingStatus(token, bookingId, status) {
  return fetchAPI(`/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

export default {
  syncUser,
  getProfile,
  updateProfile,
  becomeProvider,
  getServices,
  getServiceById,
  getCategories,
  createService,
  updateService,
  deleteService,
  getMyServices,
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
};
