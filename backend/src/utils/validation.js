// utils/validation.js
class Validation {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    // At least 6 characters
    return password && password.length >= 6;
  }

  static validatePhone(phone) {
    // Simple phone validation - adjust as needed
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  static validateRegisterInput(data) {
    const errors = {};

    if (!data.email || !this.validateEmail(data.email)) {
      errors.email = 'Valid email is required';
    }

    if (!data.password || !this.validatePassword(data.password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (data.phone && !this.validatePhone(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateServiceInput(data) {
    const errors = {};
    
    if (!data.title || data.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!data.category || data.category.trim().length < 2) {
      errors.category = 'Category is required';
    }

    if (!data.price || data.price <= 0) {
      errors.price = 'Valid price is required';
    }

    if (!data.location || data.location.trim().length < 3) {
      errors.location = 'Location is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateBookingInput(data) {
    const errors = {};

    if (!data.service_id) {
      errors.service_id = 'Service ID is required';
    }

    if (!data.booking_date) {
      errors.booking_date = 'Booking date is required';
    }

    if (!data.time_slot) {
      errors.time_slot = 'Time slot is required';
    }

    if (!data.address || data.address.trim().length < 5) {
      errors.address = 'Address is required (min 5 characters)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

module.exports = Validation;