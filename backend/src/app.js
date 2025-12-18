const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth.routes");
const servicesRoutes = require("./routes/services.routes");
const bookingsRoutes = require("./routes/bookings.routes");

// Initialize express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging (development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "SmartMatch API is running",
    timestamp: new Date().toISOString(),
  });
});

// Database connection test
app.get("/health/db", async (req, res) => {
  try {
    const { supabase } = require("./config/supabase");

    // Try a simple query
    const { data, error } = await supabase.from("users").select("id").limit(1);

    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Database connection failed",
        error: error.message,
        hint: error.hint || null,
        code: error.code || null,
      });
    }

    res.status(200).json({
      status: "ok",
      message: "Database connected successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// API info
app.get("/api", (req, res) => {
  res.status(200).json({
    name: "SmartMatch API",
    version: "1.0.0",
    description: "Service Provider Matching Platform API",
    endpoints: {
      auth: "/api/auth",
      services: "/api/services",
      bookings: "/api/bookings",
    },
  });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/bookings", bookingsRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Supabase errors
  if (err.code && err.message) {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

module.exports = app;
