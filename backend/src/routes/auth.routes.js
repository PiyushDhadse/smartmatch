// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected routes
router.get('/profile', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    // Remove sensitive data
    const userData = { ...req.user };
    delete userData.password_hash;
    
    res.json({
      success: true,
      data: userData,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

router.put('/profile', AuthMiddleware.verifyToken, UserController.updateProfile);
router.post('/change-password', AuthMiddleware.verifyToken, UserController.changePassword);
router.post('/logout', AuthMiddleware.verifyToken, UserController.logout);

// In auth.routes.js

module.exports = router;