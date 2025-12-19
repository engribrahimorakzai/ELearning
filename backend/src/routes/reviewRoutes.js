import express from 'express';
import {
  createReview,
  updateReview,
  deleteReview,
  voteReviewHelpful,
  getCourseReviews
} from '../controllers/reviewController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { createReviewValidation } from '../middleware/validation.js';

const router = express.Router();

router.post('/courses/:id/reviews', authenticate, authorize('student'), createReviewValidation, createReview);
router.get('/courses/:id/reviews', optionalAuth, getCourseReviews);
router.put('/reviews/:id', authenticate, authorize('student'), updateReview);
router.delete('/reviews/:id', authenticate, deleteReview);
router.post('/reviews/:id/helpful', authenticate, voteReviewHelpful);

export default router;
