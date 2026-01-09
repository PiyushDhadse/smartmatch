// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected routes
router.get('/profile', AuthMiddleware.verifyToken, UserController.getProfile);
router.put('/profile', AuthMiddleware.verifyToken, UserController.updateProfile);
router.post('/change-password', AuthMiddleware.verifyToken, UserController.changePassword);
router.post('/logout', AuthMiddleware.verifyToken, UserController.logout);

module.exports = router;