const express = require("express");
const router = express.Router();
const {
  syncUser,
  getProfile,
  updateProfile,
  becomeProvider,
  updateAvailability,
  getProviderStats,
} = require("../controllers/users.controller");
const {
  authenticate,
  requireProvider,
} = require("../middlewares/auth.middleware");

/**
 * @route   GET /api/auth
 * @desc    Show available auth endpoints
 * @access  Public
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Auth API endpoints",
    endpoints: {
      info: "GET /api/auth",
      syncUser: "POST /api/auth/sync-user",
      getProfile: "GET /api/auth/profile",
      updateProfile: "PUT /api/auth/profile",
      becomeProvider: "POST /api/auth/become-provider",
      updateAvailability: "PATCH /api/auth/provider/availability",
      getProviderStats: "GET /api/auth/provider/stats",
    },
  });
});

/**
 * @route   POST /api/auth/sync-user
 * @desc    Sync user from NextAuth to Supabase users table
 * @access  Public (called from NextAuth callback)
 */
router.post("/sync-user", syncUser);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put("/profile", authenticate, updateProfile);

/**
 * @route   POST /api/auth/become-provider
 * @desc    Register as a service provider
 * @access  Private
 */
router.post("/become-provider", authenticate, becomeProvider);

/**
 * @route   PATCH /api/auth/provider/availability
 * @desc    Update provider availability status
 * @access  Private (Provider only)
 */
router.patch(
  "/provider/availability",
  authenticate,
  requireProvider,
  updateAvailability
);

/**
 * @route   GET /api/auth/provider/stats
 * @desc    Get provider dashboard stats
 * @access  Private (Provider only)
 */
router.get("/provider/stats", authenticate, requireProvider, getProviderStats);

module.exports = router;
