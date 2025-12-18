// Load environment variables FIRST before any other imports
require("dotenv").config();

const app = require("./app");

// 🔹 Health check route (safe, non-intrusive)
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   SmartMatch API Server                                   ║
║                                                           ║
║   Status:  Running                                        ║
║   Port:    ${PORT}                                           ║
║   Mode:    ${
    process.env.NODE_ENV || "development"
  }                                ║
║                                                           ║
║   Health:  /health                                        ║
║   API:     /api                                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

// Unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
