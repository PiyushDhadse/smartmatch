const supabase = require('../config/supabase');
const ApiResponse = require('../utils/response');

class ReviewsController {
  // Get reviews for a provider
  static async getProviderReviews(req, res) {
    try {
      const { providerId } = req.params;
      const { page = 1, limit = 10, rating = null } = req.query;
      const offset = (page - 1) * limit;
      
      let query = supabase
        .from('provider_reviews_view')
        .select('*', { count: 'exact' })
        .eq('reviewed_provider_id', providerId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (rating) {
        query = query.eq('rating', parseInt(rating));
      }
      
      const { data: reviews, error, count } = await query;
      
      if (error) throw error;
      
      // Get rating breakdown
      const { data: ratingStats } = await supabase
        .rpc('get_provider_rating_details', { provider_uuid: providerId });
      
      return ApiResponse.success(res, {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        rating_stats: ratingStats?.[0] || {}
      }, 'Reviews retrieved successfully');
      
    } catch (error) {
      console.error('Get provider reviews error:', error);
      return ApiResponse.error(res, 'Failed to retrieve reviews');
    }
  }
  
  // Submit a review
  static async submitReview(req, res) {
    try {
      const { booking_id, rating, comment, title, rating_categories } = req.body;
      
      if (!booking_id || !rating || !comment) {
        return ApiResponse.validationError(res, {
          booking_id: 'Booking ID is required',
          rating: 'Rating is required',
          comment: 'Comment is required'
        });
      }
      
      // Use the PostgreSQL function
      const { data: reviewId, error } = await supabase
        .rpc('submit_review', {
          p_booking_id: booking_id,
          p_reviewer_id: req.userId,
          p_rating: rating,
          p_comment: comment,
          p_title: title,
          p_rating_categories: rating_categories
        });
      
      if (error) throw error;
      
      // Get the created review
      const { data: review } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();
      
      return ApiResponse.success(res, review, 'Review submitted successfully', 201);
      
    } catch (error) {
      console.error('Submit review error:', error);
      
      if (error.message.includes('Cannot review yourself')) {
        return ApiResponse.error(res, 'You cannot review yourself', 400);
      }
      
      if (error.message.includes('completed bookings')) {
        return ApiResponse.error(res, 'Can only review completed bookings', 400);
      }
      
      return ApiResponse.error(res, error.message || 'Failed to submit review');
    }
  }
  
  // Add response to a review (provider only)
  static async addResponse(req, res) {
    try {
      const { reviewId } = req.params;
      const { response_text } = req.body;
      
      if (!response_text) {
        return ApiResponse.validationError(res, {
          response_text: 'Response text is required'
        });
      }
      
      // Check if user is a provider and owns this review
      const { data: provider } = await supabase
        .from('service_providers')
        .select('id')
        .eq('user_id', req.userId)
        .single();
      
      if (!provider) {
        return ApiResponse.forbidden(res, 'Only providers can respond to reviews');
      }
      
      // Update the review
      const { data: review, error } = await supabase
        .from('reviews')
        .update({
          response_text,
          response_date: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('reviewed_provider_id', provider.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (!review) {
        return ApiResponse.notFound(res, 'Review not found or access denied');
      }
      
      return ApiResponse.success(res, review, 'Response added successfully');
      
    } catch (error) {
      console.error('Add response error:', error);
      return ApiResponse.error(res, 'Failed to add response');
    }
  }
  
  // Get user's reviews (both given and received)
  static async getUserReviews(req, res) {
    try {
      const { type = 'given' } = req.query; // 'given' or 'received'
      
      let reviewsQuery;
      
      if (type === 'given') {
        // Reviews given by user
        reviewsQuery = supabase
          .from('reviews')
          .select(`
            *,
            service_providers!reviews_reviewed_provider_id_fkey (
              business_name,
              business_logo
            ),
            users!reviews_reviewed_customer_id_fkey (
              name,
              avatar_url
            )
          `)
          .eq('reviewer_id', req.userId)
          .order('created_at', { ascending: false });
      } else {
        // Reviews received by user
        reviewsQuery = supabase
          .from('reviews')
          .select(`
            *,
            users!reviews_reviewer_id_fkey (
              name,
              avatar_url
            ),
            service_providers!reviews_reviewed_provider_id_fkey (
              business_name,
              business_logo
            )
          `)
          .or(`reviewed_customer_id.eq.${req.userId},reviewed_provider_user_id.eq.${req.userId}`)
          .order('created_at', { ascending: false });
      }
      
      const { data: reviews, error } = await reviewsQuery;
      
      if (error) throw error;
      
      return ApiResponse.success(res, reviews || [], 'Reviews retrieved successfully');
      
    } catch (error) {
      console.error('Get user reviews error:', error);
      return ApiResponse.error(res, 'Failed to retrieve user reviews');
    }
  }
  
  // Vote on review helpfulness
  static async voteHelpful(req, res) {
    try {
      const { reviewId } = req.params;
      const { is_helpful } = req.body;
      
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('review_votes') // You'll need to create this table
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', req.userId)
        .single();
      
      if (existingVote) {
        return ApiResponse.error(res, 'You have already voted on this review', 400);
      }
      
      // Record the vote
      await supabase
        .from('review_votes')
        .insert([{
          review_id: reviewId,
          user_id: req.userId,
          is_helpful: is_helpful
        }]);
      
      // Update review helpful votes
      await supabase
        .rpc('vote_review_helpful', {
          review_uuid: reviewId,
          is_helpful: is_helpful
        });
      
      return ApiResponse.success(res, null, 'Vote recorded successfully');
      
    } catch (error) {
      console.error('Vote helpful error:', error);
      return ApiResponse.error(res, 'Failed to record vote');
    }
  }
  
  // Report/flag a review
  static async flagReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { reason } = req.body;
      
      const { data: review, error } = await supabase
        .from('reviews')
        .update({
          status: 'flagged',
          flag_reason: reason,
          flagged_by_admin: false
        })
        .eq('id', reviewId)
        .select('*')
        .single();
      
      if (error) throw error;
      
      return ApiResponse.success(res, review, 'Review flagged for moderation');
      
    } catch (error) {
      console.error('Flag review error:', error);
      return ApiResponse.error(res, 'Failed to flag review');
    }
  }
}

module.exports = ReviewsController;