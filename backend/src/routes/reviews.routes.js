const express = require('express');
const router = express.Router();
const ReviewsController = require('../controllers/reviews.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.get('/provider/:providerId', ReviewsController.getProviderReviews);

// Protected routes
router.post('/', AuthMiddleware.verifyToken, ReviewsController.submitReview);
router.get('/my', AuthMiddleware.verifyToken, ReviewsController.getUserReviews);
router.put('/:reviewId/response', AuthMiddleware.verifyToken, ReviewsController.addResponse);
router.post('/:reviewId/vote', AuthMiddleware.verifyToken, ReviewsController.voteHelpful);
router.post('/:reviewId/flag', AuthMiddleware.verifyToken, ReviewsController.flagReview);

// Admin routes
router.get('/moderation/queue', 
  AuthMiddleware.verifyToken, 
  AuthMiddleware.authorize('admin'), 
  async (req, res) => {
    // Admin moderation endpoint
    const { data } = await supabase
      .from('review_moderation_queue')
      .select('*');
    
    res.json({ success: true, data });
  }
);

router.put('/:reviewId/moderate', 
  AuthMiddleware.verifyToken, 
  AuthMiddleware.authorize('admin'), 
  async (req, res) => {
    const { status, moderator_notes } = req.body;
    // Admin moderation logic
  }
);

module.exports = router;