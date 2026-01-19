const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

class AuthMiddleware {
  // Verify JWT token
  static async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token provided"
        });
      }

      const token = authHeader.split(" ")[1];
      
      // Verify token using your AuthUtils (or jwt directly)
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token"
        });
      }

      // DEBUG: Log token payload
      console.log("🔐 Token decoded:", decoded);

      // Get user from database - check both possible ID fields
      const userId = decoded.id || decoded.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Invalid token: No user ID found"
        });
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("id, name, email, role, avatar_url, is_active")
        .eq("id", userId)
        .single();

      if (error || !user) {
        console.error("User lookup error:", error);
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: "Account is disabled"
        });
      }

      // Attach user to request
      req.user = user;
      req.userId = user.id;
      next();
      
    } catch (error) {
      console.error("Auth middleware error:", error);
      
      return res.status(500).json({
        success: false,
        message: "Authentication failed"
      });
    }
  }

  // Role-based authorization
  static authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions"
        });
      }

      next();
    };
  }

  // Role-based authorization
  static authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
        });
      }

      next();
    };
  }

  // Optional authentication
  static async optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];

        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);

          const { data: user } = await supabase
            .from("users")
            .select("id, name, email, role, avatar_url")
            .eq("id", decoded.userId || decoded.id)
            .single();

          if (user) {
            req.user = user;
            req.userId = user.id;
          }
        } catch (error) {
          // Invalid token - continue without auth
          console.log("Optional auth token invalid:", error.message);
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
