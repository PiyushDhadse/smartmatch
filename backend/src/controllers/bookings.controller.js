const { supabase } = require("../config/supabase");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response");

/**
 * Create a new booking
 * POST /api/bookings
 */
const createBooking = async (req, res) => {
  try {
    const {
      service_id,
      booking_date,
      time_slot,
      address,
      city,
      urgency,
      notes,
    } = req.body;
    const userId = req.user.id;

    // Validation
    if (!service_id || !booking_date || !time_slot) {
      return sendError(
        res,
        "Service ID, booking date, and time slot are required",
        400
      );
    }

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("provider_id, is_active")
      .eq("id", service_id)
      .single();

    if (serviceError || !service) {
      return sendError(res, "Service not found", 404);
    }

    if (!service.is_active) {
      return sendError(res, "This service is currently unavailable", 400);
    }

    // Check if time slot is already booked
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("service_id", service_id)
      .eq("booking_date", booking_date)
      .eq("time_slot", time_slot)
      .not("status", "in", '("cancelled")')
      .single();

    if (existingBooking) {
      return sendError(res, "This time slot is already booked", 409);
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        service_id,
        provider_id: service.provider_id,
        booking_date,
        time_slot,
        address,
        city,
        urgency,
        notes,
        status: "pending",
      })
      .select(
        `
        *,
        services (
          title,
          price,
          category
        ),
        service_providers (
          users (
            name,
            phone
          )
        )
      `
      )
      .single();

    if (bookingError) {
      console.error("Create booking error:", bookingError);
      return sendError(res, "Failed to create booking", 500);
    }

    // Create initial tracking entry
    await supabase.from("booking_tracking").insert({
      booking_id: booking.id,
      current_status: "Booking created - Awaiting provider confirmation",
    });

    return sendSuccess(res, booking, "Booking created successfully", 201);
  } catch (error) {
    console.error("Create booking error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Get all bookings for a user
 * GET /api/bookings/my-bookings
 */
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = supabase
      .from("bookings")
      .select(
        `
        *,
        services (
          id,
          title,
          description,
          price,
          category,
          location
        ),
        service_providers (
          id,
          users (
            name,
            phone
          )
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Get bookings error:", error);
      return sendError(res, "Failed to fetch bookings", 500);
    }

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    };

    return sendPaginated(
      res,
      data,
      pagination,
      "Bookings fetched successfully"
    );
  } catch (error) {
    console.error("Get bookings error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Get bookings for a provider
 * GET /api/bookings/provider-bookings
 */
const getProviderBookings = async (req, res) => {
  try {
    const providerId = req.provider.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = supabase
      .from("bookings")
      .select(
        `
        *,
        services (
          id,
          title,
          price,
          category
        ),
        users (
          id,
          name,
          phone
        )
      `,
        { count: "exact" }
      )
      .eq("provider_id", providerId)
      .order("booking_date", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Get provider bookings error:", error);
      return sendError(res, "Failed to fetch bookings", 500);
    }

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    };

    return sendPaginated(
      res,
      data,
      pagination,
      "Provider bookings fetched successfully"
    );
  } catch (error) {
    console.error("Get provider bookings error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Get booking by ID
 * GET /api/bookings/:id
 */
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        services (
          *
        ),
        service_providers (
          id,
          users (
            name,
            phone
          )
        ),
        booking_tracking (
          id,
          current_status,
          updated_at
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return sendError(res, "Booking not found", 404);
      }
      return sendError(res, "Failed to fetch booking", 500);
    }

    // Check if user has access (either the customer or the provider)
    const { data: provider } = await supabase
      .from("service_providers")
      .select("id")
      .eq("user_id", userId)
      .single();

    const isCustomer = data.user_id === userId;
    const isProvider = provider && data.provider_id === provider.id;

    if (!isCustomer && !isProvider) {
      return sendError(res, "Not authorized to view this booking", 403);
    }

    return sendSuccess(res, data, "Booking fetched successfully");
  } catch (error) {
    console.error("Get booking error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Update booking status (Provider)
 * PATCH /api/bookings/:id/status
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const providerId = req.provider.id;

    const validStatuses = [
      "pending",
      "accepted",
      "in_progress",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return sendError(res, "Invalid status", 400);
    }

    // Check booking exists and belongs to provider
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("provider_id, status")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      return sendError(res, "Booking not found", 404);
    }

    if (booking.provider_id !== providerId) {
      return sendError(res, "Not authorized to update this booking", 403);
    }

    // Status transition validation
    const statusFlow = {
      pending: ["accepted", "cancelled"],
      accepted: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    if (!statusFlow[booking.status].includes(status)) {
      return sendError(
        res,
        `Cannot transition from ${booking.status} to ${status}`,
        400
      );
    }

    // Update booking
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update booking status error:", error);
      return sendError(res, "Failed to update booking status", 500);
    }

    // Add tracking entry
    const statusMessages = {
      accepted: "Booking accepted by provider",
      in_progress: "Service is in progress",
      completed: "Service completed successfully",
      cancelled: "Booking has been cancelled",
    };

    await supabase.from("booking_tracking").insert({
      booking_id: id,
      current_status: statusMessages[status] || `Status updated to ${status}`,
    });

    return sendSuccess(res, data, "Booking status updated successfully");
  } catch (error) {
    console.error("Update booking status error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Cancel booking (User)
 * PATCH /api/bookings/:id/cancel
 */
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check booking exists and belongs to user
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("user_id, status")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      return sendError(res, "Booking not found", 404);
    }

    if (booking.user_id !== userId) {
      return sendError(res, "Not authorized to cancel this booking", 403);
    }

    // Can only cancel if pending or accepted
    if (!["pending", "accepted"].includes(booking.status)) {
      return sendError(
        res,
        `Cannot cancel a booking with status: ${booking.status}`,
        400
      );
    }

    // Update booking
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Cancel booking error:", error);
      return sendError(res, "Failed to cancel booking", 500);
    }

    // Add tracking entry
    await supabase.from("booking_tracking").insert({
      booking_id: id,
      current_status: "Booking cancelled by customer",
    });

    return sendSuccess(res, data, "Booking cancelled successfully");
  } catch (error) {
    console.error("Cancel booking error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Get booking tracking history
 * GET /api/bookings/:id/tracking
 */
const getBookingTracking = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("booking_tracking")
      .select("*")
      .eq("booking_id", id)
      .order("updated_at", { ascending: true });

    if (error) {
      console.error("Get tracking error:", error);
      return sendError(res, "Failed to fetch tracking history", 500);
    }

    return sendSuccess(res, data, "Tracking history fetched successfully");
  } catch (error) {
    console.error("Get tracking error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Get available time slots for a service on a date
 * GET /api/bookings/available-slots
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { service_id, date } = req.query;

    if (!service_id || !date) {
      return sendError(res, "Service ID and date are required", 400);
    }

    // Get booked slots for the service on the given date
    const { data: bookedSlots, error } = await supabase
      .from("bookings")
      .select("time_slot")
      .eq("service_id", service_id)
      .eq("booking_date", date)
      .not("status", "eq", "cancelled");

    if (error) {
      console.error("Get available slots error:", error);
      return sendError(res, "Failed to fetch available slots", 500);
    }

    // All possible time slots (customize as needed)
    const allSlots = [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
      "06:00 PM",
    ];

    const bookedSlotTimes = bookedSlots.map((b) => b.time_slot);
    const availableSlots = allSlots.filter(
      (slot) => !bookedSlotTimes.includes(slot)
    );

    return sendSuccess(
      res,
      availableSlots,
      "Available slots fetched successfully"
    );
  } catch (error) {
    console.error("Get available slots error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getBookingTracking,
  getAvailableSlots,
};
