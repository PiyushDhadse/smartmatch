// backend/src/controllers/users.controller.js
const { supabase } = require("../config/supabase");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Sync user from NextAuth to Supabase
 * POST /api/auth/sync-user
 */
const syncUser = async (req, res) => {
  try {
    const { id, name, email, image } = req.body;

    if (!id) {
      return sendError(res, "User ID is required", 400);
    }

    // Upsert user into database
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          id,
          name: name || null,
          email: email || null,
          avatar_url: image || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Sync user error:", error);
      return sendError(res, "Failed to sync user", 500, error.message);
    }

    sendSuccess(res, data, "User synced successfully!");
  } catch (error) {
    console.error("Sync user error:", error);
    sendError(res, "Failed to sync user", 500, error.message);
  }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    // If user is a provider, fetch provider details too
    let providerDetails = null;
    if (user.role === "provider") {
      const { data } = await supabase
        .from("service_providers")
        .select("*")
        .eq("user_id", user.id)
        .single();
      providerDetails = data;
    }

    sendSuccess(
      res,
      {
        ...user,
        provider: providerDetails,
      },
      "Profile fetched successfully!"
    );
  } catch (error) {
    console.error("Get profile error:", error);
    sendError(res, "Failed to fetch profile", 500, error.message);
  }
};

/**
 * Update current user profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return sendError(res, "Failed to update profile", 500, error.message);
    }

    sendSuccess(res, data, "Profile updated successfully!");
  } catch (error) {
    console.error("Update profile error:", error);
    sendError(res, "Failed to update profile", 500, error.message);
  }
};

/**
 * Register as a service provider
 * POST /api/auth/become-provider
 */
const becomeProvider = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if already a provider
    const { data: existingProvider } = await supabase
      .from("service_providers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingProvider) {
      return sendError(res, "Already registered as a provider", 400);
    }

    // Create provider profile
    const { data: provider, error: providerError } = await supabase
      .from("service_providers")
      .insert({
        user_id: userId,
        is_verified: false,
        rating: 0,
        total_jobs: 0,
        availability_status: "offline",
      })
      .select()
      .single();

    if (providerError) {
      return sendError(
        res,
        "Failed to create provider profile",
        500,
        providerError.message
      );
    }

    // Update user role
    const { error: userError } = await supabase
      .from("users")
      .update({ role: "provider" })
      .eq("id", userId);

    if (userError) {
      // Rollback provider creation
      await supabase.from("service_providers").delete().eq("id", provider.id);
      return sendError(
        res,
        "Failed to update user role",
        500,
        userError.message
      );
    }

    sendSuccess(res, provider, "Successfully registered as a provider!", 201);
  } catch (error) {
    console.error("Become provider error:", error);
    sendError(res, "Failed to register as provider", 500, error.message);
  }
};

/**
 * Update provider availability status
 * PATCH /api/auth/provider/availability
 */
const updateAvailability = async (req, res) => {
  try {
    const providerId = req.provider.id;
    const { availability_status } = req.body;

    const validStatuses = ["available", "busy", "offline"];
    if (!validStatuses.includes(availability_status)) {
      return sendError(
        res,
        "Invalid availability status. Use: available, busy, or offline",
        400
      );
    }

    const { data, error } = await supabase
      .from("service_providers")
      .update({ availability_status })
      .eq("id", providerId)
      .select()
      .single();

    if (error) {
      return sendError(
        res,
        "Failed to update availability",
        500,
        error.message
      );
    }

    sendSuccess(res, data, "Availability updated successfully!");
  } catch (error) {
    console.error("Update availability error:", error);
    sendError(res, "Failed to update availability", 500, error.message);
  }
};

/**
 * Get provider dashboard stats
 * GET /api/auth/provider/stats
 */
const getProviderStats = async (req, res) => {
  try {
    const providerId = req.provider.id;

    // Get booking counts by status
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("status")
      .eq("provider_id", providerId);

    if (bookingsError) {
      return sendError(
        res,
        "Failed to fetch stats",
        500,
        bookingsError.message
      );
    }

    // Calculate stats
    const stats = {
      total_bookings: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      accepted: bookings.filter((b) => b.status === "accepted").length,
      in_progress: bookings.filter((b) => b.status === "in_progress").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      rating: req.provider.rating,
      total_jobs: req.provider.total_jobs,
      is_verified: req.provider.is_verified,
      availability_status: req.provider.availability_status,
    };

    sendSuccess(res, stats, "Provider stats fetched successfully!");
  } catch (error) {
    console.error("Get provider stats error:", error);
    sendError(res, "Failed to fetch stats", 500, error.message);
  }
};

module.exports = {
  syncUser,
  getProfile,
  updateProfile,
  becomeProvider,
  updateAvailability,
  getProviderStats,
};
