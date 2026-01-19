// controllers/bookings.controller.js
const supabase = require("../config/supabase");
const ApiResponse = require("../utils/response");
const Validation = require("../utils/validation");

class BookingController {
  // Create a new booking
  static async createBooking(req, res) {
    try {
      const validation = Validation.validateBookingInput(req.body);
      if (!validation.isValid) {
        return ApiResponse.validationError(res, validation.errors);
      }

      // Get service details
      const { data: service, error: serviceError } = await supabase
        .from("services")
        .select(
          `
          *,
          service_providers:provider_id (
            id,
            user_id
          )
        `,
        )
        .eq("id", req.body.service_id)
        .eq("is_active", true)
        .single();

      if (serviceError || !service) {
        return ApiResponse.notFound(res, "Service not found or inactive");
      }

      // Check if provider is available
      if (service.service_providers.availability_status === "offline") {
        return ApiResponse.error(
          res,
          "Service provider is currently offline",
          400,
        );
      }

      const bookingData = {
        user_id: req.userId,
        service_id: req.body.service_id,
        provider_id: service.service_providers.id,
        booking_date: req.body.booking_date,
        time_slot: req.body.time_slot,
        address: req.body.address,
        city: req.body.city || req.body.address.split(",").pop().trim(),
        urgency: req.body.urgency || "normal",
        notes: req.body.notes || null,
        status: "pending",
      };

      // Create booking
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select(
          `
          *,
          services:service_id (
            title,
            price,
            category
          ),
          service_providers:provider_id (
            users:user_id (
              name,
              phone
            )
          )
        `,
        )
        .single();

      if (error) {
        throw error;
      }

      // Create initial tracking entry
      await supabase.from("booking_tracking").insert([
        {
          booking_id: booking.id,
          current_status: "pending",
        },
      ]);

      return ApiResponse.success(
        res,
        booking,
        "Booking created successfully",
        201,
      );
    } catch (error) {
      console.error("Create booking error:", error);
      return ApiResponse.error(res, "Failed to create booking");
    }
  }

  // In getUserBookings method, add more detailed logging:
  // In getUserBookings method, simplify the query:
  // Replace your current getUserBookings method with this SIMPLIFIED version:
  static async getUserBookings(req, res) {
    try {
      console.log("Getting bookings for user:", req.userId);

      // SIMPLE query - just get bookings without complex joins
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("customer_id", req.userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Bookings query error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to retrieve bookings: " + error.message,
        });
      }

      console.log(`Found ${bookings?.length || 0} bookings`);

      return res.json({
        success: true,
        data: bookings || [],
        message: "Bookings retrieved successfully",
      });
    } catch (error) {
      console.error("Get user bookings error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve bookings",
      });
    }
  }

  // Get provider's bookings
  // Get provider's bookings
  static async getProviderBookings(req, res) {
    try {
      console.log("Getting provider bookings for user:", req.userId);

      // First, check if user is a provider and get their provider ID
      const { data: provider, error: providerError } = await supabase
        .from("service_providers")
        .select("id")
        .eq("user_id", req.userId)
        .single();

      if (providerError || !provider) {
        console.log("User is not a provider or provider not found");
        return res.status(403).json({
          success: false,
          message: "Only service providers can access provider bookings",
        });
      }

      const { status } = req.query;
      console.log("Provider ID:", provider.id, "Status filter:", status);

      // Simple query - get bookings for this provider
      let query = supabase
        .from("bookings")
        .select("*")
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data: bookings, error } = await query;

      if (error) {
        console.error("Provider bookings query error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to retrieve provider bookings: " + error.message,
        });
      }

      console.log(`Found ${bookings?.length || 0} provider bookings`);

      return res.json({
        success: true,
        data: bookings || [],
        message: "Provider bookings retrieved successfully",
      });
    } catch (error) {
      console.error("Get provider bookings error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve provider bookings",
      });
    }
  }

  // Update booking status (provider only)
  static async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        !status ||
        !["pending", "confirmed", "completed", "cancelled"].includes(status)
      ) {
        return ApiResponse.validationError(res, {
          status:
            "Valid status is required (pending, confirmed, completed, cancelled)",
        });
      }

      // Check if booking exists
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("provider_id")
        .eq("id", id)
        .single();

      if (bookingError || !booking) {
        return ApiResponse.notFound(res, "Booking not found");
      }

      // Check if user is the provider for this booking
      const { data: provider } = await supabase
        .from("service_providers")
        .select("id")
        .eq("user_id", req.userId)
        .eq("id", booking.provider_id)
        .single();

      if (!provider) {
        return ApiResponse.forbidden(
          res,
          "You can only update your own bookings",
        );
      }

      // Update booking status
      const { data: updatedBooking, error } = await supabase
        .from("bookings")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      // Add tracking entry
      await supabase.from("booking_tracking").insert([
        {
          booking_id: id,
          current_status: status,
        },
      ]);

      // If booking is completed, increment provider's job count
      if (status === "completed") {
        await supabase.rpc("increment_provider_jobs", {
          provider_id: booking.provider_id,
        });
      }

      return ApiResponse.success(
        res,
        updatedBooking,
        "Booking status updated successfully",
      );
    } catch (error) {
      console.error("Update booking status error:", error);
      return ApiResponse.error(res, "Failed to update booking status");
    }
  }

  // Get booking tracking
  static async getBookingTracking(req, res) {
    try {
      const { id } = req.params;

      // Check if user has access to this booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("user_id, provider_id")
        .eq("id", id)
        .single();

      if (bookingError || !booking) {
        return ApiResponse.notFound(res, "Booking not found");
      }

      // Check if user is either the customer or the provider
      const isCustomer = booking.user_id === req.userId;
      const isProvider = await supabase
        .from("service_providers")
        .select("id")
        .eq("user_id", req.userId)
        .eq("id", booking.provider_id)
        .single();

      if (!isCustomer && !isProvider.data) {
        return ApiResponse.forbidden(res, "Access denied");
      }

      const { data: tracking, error } = await supabase
        .from("booking_tracking")
        .select("*")
        .eq("booking_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return ApiResponse.success(
        res,
        tracking,
        "Tracking retrieved successfully",
      );
    } catch (error) {
      console.error("Get booking tracking error:", error);
      return ApiResponse.error(res, "Failed to retrieve booking tracking");
    }
  }

  // Cancel booking (customer only)
  static async cancelBooking(req, res) {
    try {
      const { id } = req.params;

      // Check if booking exists and belongs to user
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .eq("user_id", req.userId)
        .single();

      if (bookingError || !booking) {
        return ApiResponse.notFound(res, "Booking not found or access denied");
      }

      // Can only cancel pending or confirmed bookings
      if (!["pending", "confirmed"].includes(booking.status)) {
        return ApiResponse.error(
          res,
          `Cannot cancel a ${booking.status} booking`,
          400,
        );
      }

      // Update booking status to cancelled
      const { data: updatedBooking, error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      // Add tracking entry
      await supabase.from("booking_tracking").insert([
        {
          booking_id: id,
          current_status: "cancelled",
        },
      ]);

      return ApiResponse.success(
        res,
        updatedBooking,
        "Booking cancelled successfully",
      );
    } catch (error) {
      console.error("Cancel booking error:", error);
      return ApiResponse.error(res, "Failed to cancel booking");
    }
  }
}

module.exports = BookingController;
