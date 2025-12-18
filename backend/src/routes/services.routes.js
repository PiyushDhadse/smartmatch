const express = require("express");
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByProvider,
  getCategories,
  getMyServices,
} = require("../controllers/services.controller");
const {
  authenticate,
  requireProvider,
  optionalAuth,
} = require("../middlewares/auth.middleware");

/**
 * @route   GET /api/services/categories
 * @desc    Get all service categories
 * @access  Public
 */
router.get("/categories", getCategories);

/**
 * @route   GET /api/services/my-services
 * @desc    Get authenticated provider's services
 * @access  Private (Provider only)
 */
router.get("/my-services", authenticate, requireProvider, getMyServices);

/**
 * @route   GET /api/services/provider/:providerId
 * @desc    Get all services by a specific provider
 * @access  Public
 */
router.get("/provider/:providerId", getServicesByProvider);

/**
 * @route   GET /api/services
 * @desc    Get all services with optional filters
 * @access  Public
 * @query   category, location, min_price, max_price, search, page, limit, sort_by, sort_order
 */
router.get("/", optionalAuth, getAllServices);

/**
 * @route   GET /api/services/:id
 * @desc    Get service by ID
 * @access  Public
 */
router.get("/:id", optionalAuth, getServiceById);

/**
 * @route   POST /api/services
 * @desc    Create a new service
 * @access  Private (Provider only)
 */
router.post("/", authenticate, requireProvider, createService);

/**
 * @route   PUT /api/services/:id
 * @desc    Update a service
 * @access  Private (Provider only, own service)
 */
router.put("/:id", authenticate, requireProvider, updateService);

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete a service
 * @access  Private (Provider only, own service)
 */
router.delete("/:id", authenticate, requireProvider, deleteService);

module.exports = router;
