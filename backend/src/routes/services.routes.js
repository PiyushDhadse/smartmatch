// routes/services.routes.js
const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/services.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.get('/', ServiceController.getAllServices);
router.get('/:id', ServiceController.getServiceById);

// Protected routes
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.authorize('provider'), ServiceController.createService);
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.authorize('provider'), ServiceController.updateService);
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.authorize('provider'), ServiceController.deleteService);
router.get('/my/services', AuthMiddleware.verifyToken, AuthMiddleware.authorize('provider'), ServiceController.getMyServices);

module.exports = router;