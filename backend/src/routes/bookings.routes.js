const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getBookingTracking,
  getAvailableSlots,
} = require("../controllers/bookings.controller");
const {
  authenticate,
  requireProvider,
} = require("../middlewares/auth.middleware");

/**
 * @route   GET /api/bookings/available-slots
 * @desc    Get available time slots for a service on a date
 * @access  Public
 * @query   service_id, date
 */
router.get("/available-slots", getAvailableSlots);

/**
 * @route   GET /api/bookings/my-bookings
 * @desc    Get all bookings for the authenticated user
 * @access  Private
 * @query   status, page, limit
 */
router.get("/my-bookings", authenticate, getMyBookings);

/**
 * @route   GET /api/bookings/provider-bookings
 * @desc    Get all bookings for the authenticated provider
 * @access  Private (Provider only)
 * @query   status, page, limit
 */
router.get(
  "/provider-bookings",
  authenticate,
  requireProvider,
  getProviderBookings
);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post("/", authenticate, createBooking);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private (Customer or Provider)
 */
router.get("/:id", authenticate, getBookingById);

/**
 * @route   GET /api/bookings/:id/tracking
 * @desc    Get booking tracking history
 * @access  Private
 */
router.get("/:id/tracking", authenticate, getBookingTracking);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status
 * @access  Private (Provider only)
 */
router.patch("/:id/status", authenticate, requireProvider, updateBookingStatus);

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private (Customer only)
 */
router.patch("/:id/cancel", authenticate, cancelBooking);

module.exports = router;
