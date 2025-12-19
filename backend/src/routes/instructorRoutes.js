import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getCourseAnalytics,
  getStudentProgress,
  getEarningsData,
  respondToReview
} from '../controllers/instructorController.js';

const router = express.Router();

router.get('/courses/:course_id/analytics', authenticate, authorize('instructor', 'admin'), getCourseAnalytics);
router.get('/courses/:course_id/students', authenticate, authorize('instructor', 'admin'), getStudentProgress);
router.get('/earnings', authenticate, authorize('instructor', 'admin'), getEarningsData);
router.post('/reviews/:review_id/respond', authenticate, authorize('instructor', 'admin'), respondToReview);

export default router;
