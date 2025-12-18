const { supabase } = require("../config/supabase");
const { sendError } = require("../utils/response");

/**
 * Verify JWT token from NextAuth session
 * Expects Authorization header: Bearer <token> or x-user-id header
 */
const authenticate = async (req, res, next) => {
  try {
    // Option 1: Get user ID from custom header (set by Next.js frontend)
    const userId = req.headers["x-user-id"];

    // Option 2: Get from Authorization Bearer token
    const authHeader = req.headers.authorization;

    if (!userId && !authHeader) {
      return sendError(res, "Authentication required", 401);
    }

    let authenticatedUserId = userId;

    // If using Bearer token, verify with Supabase
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return sendError(res, "Invalid or expired token", 401);
      }

      authenticatedUserId = user.id;
    }

    // Fetch user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authenticatedUserId)
      .single();

    if (profileError || !userProfile) {
      // User exists in auth but not in users table - could auto-create
      req.user = { id: authenticatedUserId, role: "user" };
    } else {
      req.user = userProfile;
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return sendError(res, "Authentication failed", 401);
  }
};

/**
 * Check if user has required role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, "Insufficient permissions", 403);
    }

    next();
  };
};

/**
 * Check if user is a verified service provider
 */
const requireProvider = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    const { data: provider, error } = await supabase
      .from("service_providers")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error || !provider) {
      return sendError(res, "Service provider profile required", 403);
    }

    req.provider = provider;
    next();
  } catch (error) {
    console.error("Provider check error:", error);
    return sendError(res, "Authorization failed", 500);
  }
};

/**
 * Optional authentication - doesn't fail if no auth provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];
    const authHeader = req.headers.authorization;

    if (!userId && !authHeader) {
      req.user = null;
      return next();
    }

    // Reuse authenticate logic
    return authenticate(req, res, next);
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  requireRole,
  requireProvider,
  optionalAuth,
};
