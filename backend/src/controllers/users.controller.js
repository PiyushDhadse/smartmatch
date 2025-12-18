const { supabase } = require("../config/supabase");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * Get or create user profile
 * POST /api/auth/sync-user
 */
const syncUser = async (req, res) => {
  try {
    const { id, name, email, image } = req.body;

    if (!id || !email) {
      return sendError(res, "User ID and email are required", 400);
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (existingUser) {
      // Update user if needed
      const { data, error } = await supabase
        .from("users")
        .update({ name: name || existingUser.name })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Update user error:", error);
        return sendError(res, "Failed to update user", 500);
      }

      return sendSuccess(res, data, "User synced successfully");
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        id,
        name: name || email.split("@")[0],
        role: "user",
      })
      .select()
      .single();

    if (createError) {
      console.error("Create user error:", createError);
      return sendError(res, "Failed to create user", 500);
    }

    return sendSuccess(res, newUser, "User created successfully", 201);
  } catch (error) {
    console.error("Sync user error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Get user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("users")
      .select(
        `
        *,
        service_providers (
          id,
          is_verified,
          availability_status
        )
      `
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Get profile error:", error);
      return sendError(res, "Failed to fetch profile", 500);
    }

    return sendSuccess(res, data, "Profile fetched successfully");
  } catch (error) {
    console.error("Get profile error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Update profile error:", error);
      return sendError(res, "Failed to update profile", 500);
    }

    return sendSuccess(res, data, "Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Become a service provider
 * POST /api/users/become-provider
 */
const becomeProvider = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if already a provider
    const { data: existing } = await supabase
      .from("service_providers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      return sendError(res, "You are already registered as a provider", 400);
    }

    // Create provider profile
    const { data: provider, error: providerError } = await supabase
      .from("service_providers")
      .insert({
        user_id: userId,
        is_verified: false,
        availability_status: "available",
      })
      .select()
      .single();

    if (providerError) {
      console.error("Create provider error:", providerError);
      return sendError(res, "Failed to create provider profile", 500);
    }

    // Update user role
    await supabase.from("users").update({ role: "provider" }).eq("id", userId);

    return sendSuccess(res, provider, "You are now a service provider!", 201);
  } catch (error) {
    console.error("Become provider error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Update provider availability
 * PATCH /api/users/provider/availability
 */
const updateAvailability = async (req, res) => {
  try {
    const providerId = req.provider.id;
    const { availability_status } = req.body;

    const validStatuses = ["available", "busy", "offline"];
    if (!validStatuses.includes(availability_status)) {
      return sendError(res, "Invalid availability status", 400);
    }

    const { data, error } = await supabase
      .from("service_providers")
      .update({ availability_status })
      .eq("id", providerId)
      .select()
      .single();

    if (error) {
      console.error("Update availability error:", error);
      return sendError(res, "Failed to update availability", 500);
    }

    return sendSuccess(res, data, "Availability updated successfully");
  } catch (error) {
    console.error("Update availability error:", error);
    return sendError(res, "Internal server error", 500);
  }
};

/**
 * Get provider stats
 * GET /api/users/provider/stats
 */
const getProviderStats = async (req, res) => {
  try {
    const providerId = req.provider.id;

    // Get provider info
    const { data: provider } = await supabase
      .from("service_providers")
      .select("*")
      .eq("id", providerId)
      .single();

    // Get booking stats
    const { data: bookings } = await supabase
      .from("bookings")
      .select("status")
      .eq("provider_id", providerId);

    const stats = {
      // Approximate total jobs as completed bookings count
      total_jobs: bookings?.filter((b) => b.status === "completed").length || 0,
      is_verified: provider.is_verified,
      availability_status: provider.availability_status,
      bookings: {
        total: bookings?.length || 0,
        pending: bookings?.filter((b) => b.status === "pending").length || 0,
        accepted: bookings?.filter((b) => b.status === "accepted").length || 0,
        in_progress:
          bookings?.filter((b) => b.status === "in_progress").length || 0,
        completed:
          bookings?.filter((b) => b.status === "completed").length || 0,
        cancelled:
          bookings?.filter((b) => b.status === "cancelled").length || 0,
      },
    };

    // Get active services count
    const { count: servicesCount } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("provider_id", providerId)
      .eq("is_active", true);

    stats.active_services = servicesCount || 0;

    return sendSuccess(res, stats, "Provider stats fetched successfully");
  } catch (error) {
    console.error("Get provider stats error:", error);
    return sendError(res, "Internal server error", 500);
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
