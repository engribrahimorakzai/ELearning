import express from 'express';
import { getPlatformStats, getEnrollmentTrend, getAdminAnalytics } from '../controllers/statsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route - no authentication required
router.get('/platform', getPlatformStats);

// Admin only routes
router.get('/admin/analytics', authenticate, authorize('admin'), getAdminAnalytics);
router.get('/enrollment-trend', authenticate, getEnrollmentTrend);

export default router;
