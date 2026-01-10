// routes/bookings.routes.js
const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookings.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

// Protected routes
router.post('/', AuthMiddleware.verifyToken, BookingController.createBooking);
router.get('/my', AuthMiddleware.verifyToken, BookingController.getUserBookings);
router.get('/provider', AuthMiddleware.verifyToken, AuthMiddleware.authorize('provider'), BookingController.getProviderBookings);
router.put('/:id/status', AuthMiddleware.verifyToken, AuthMiddleware.authorize('provider'), BookingController.updateBookingStatus);
router.get('/:id/tracking', AuthMiddleware.verifyToken, BookingController.getBookingTracking);
router.delete('/:id/cancel', AuthMiddleware.verifyToken, BookingController.cancelBooking);

module.exports = router;