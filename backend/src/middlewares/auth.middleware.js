// backend/src/middlewares/auth.middleware.js
const { supabase } = require("../config/supabase");
const { sendError } = require("../utils/response");

/**
 * Authenticate user via user ID in headers
 * Frontend should send: { "x-user-id": "user-uuid" }
 */
const authenticate = async (req, res, next) => {
  try {
    let userId = req.headers["x-user-id"];

    // Also check Authorization header
    if (!userId && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        userId = authHeader.substring(7);
      }
    }

    if (!userId) {
      return sendError(res, "Authentication required. Missing user ID.", 401);
    }

    // Fetch user from database
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return sendError(res, "User not found", 401);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    sendError(res, "Authentication failed", 500, error.message);
  }
};

/**
 * Require user to be a provider
 */
const requireProvider = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    if (req.user.role !== "provider") {
      return sendError(res, "Provider access required", 403);
    }

    // Fetch provider details
    const { data: provider, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error || !provider) {
      return sendError(res, "Provider profile not found", 404);
    }

    // Attach provider to request object
    req.provider = provider;
    next();
  } catch (error) {
    console.error("Provider middleware error:", error);
    sendError(res, "Authorization failed", 500, error.message);
  }
};

/**
 * Optional authentication - doesn't fail if no user
 */
const optionalAuth = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    if (userId) {
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without user
    next();
  }
};

module.exports = {
  authenticate,
  requireProvider,
  optionalAuth,
};
