// middlewares/auth.middleware.js
const AuthUtils = require("../utils/auth");
const supabase = require("../config/supabase");
const ApiResponse = require("../utils/response");

class AuthMiddleware {
  // In auth.middleware.js, update the verifyToken function:
  static async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return ApiResponse.unauthorized(res, "No token provided");
      }

      const token = authHeader.split(" ")[1];
      const decoded = AuthUtils.verifyToken(token);

      if (!decoded) {
        return ApiResponse.unauthorized(res, "Invalid or expired token");
      }

      // Verify user exists in database - SELECT ALL COLUMNS (*)
      const { data: user, error } = await supabase
        .from("users")
        .select("*") // ← CHANGE THIS from specific columns to *
        .eq("id", decoded.id)
        .single();

      if (error || !user) {
        return ApiResponse.unauthorized(res, "User not found");
      }

      // Set user session in Supabase for RLS
      await AuthUtils.setSupabaseSession(supabase, user.id);

      // Attach user to request
      req.user = user;
      req.userId = user.id; // Make sure this is set
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return ApiResponse.error(res, "Authentication failed");
    }
  }

  // Role-based authorization
  static authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return ApiResponse.unauthorized(res, "Authentication required");
      }

      if (!roles.includes(req.user.role)) {
        return ApiResponse.forbidden(res, "Insufficient permissions");
      }

      next();
    };
  }

  // Optional authentication (sets user if token exists)
  static async optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const decoded = AuthUtils.verifyToken(token);

        if (decoded) {
          const { data: user } = await supabase
            .from("users")
            .select("id, email, name, role, avatar_url")
            .eq("id", decoded.id)
            .single();

          if (user) {
            await AuthUtils.setSupabaseSession(supabase, user.id);
            req.user = user;
            req.userId = user.id;
          }
        }
      }
      next();
    } catch (error) {
      // Continue without auth on error
      next();
    }
  }
}

module.exports = AuthMiddleware;
