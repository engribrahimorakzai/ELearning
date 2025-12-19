import express from 'express';
import {
  createSection,
  updateSection,
  deleteSection,
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
  markLessonComplete
} from '../controllers/curriculumController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createSectionValidation, createLessonValidation } from '../middleware/validation.js';

const router = express.Router();

// Section routes
router.post('/courses/:id/sections', authenticate, authorize('instructor', 'admin'), createSectionValidation, createSection);
router.put('/sections/:id', authenticate, authorize('instructor', 'admin'), updateSection);
router.delete('/sections/:id', authenticate, authorize('instructor', 'admin'), deleteSection);

// Lesson routes
router.post('/sections/:id/lessons', authenticate, authorize('instructor', 'admin'), createLessonValidation, createLesson);
router.get('/lessons/:id', authenticate, getLesson);
router.put('/lessons/:id', authenticate, authorize('instructor', 'admin'), updateLesson);
router.delete('/lessons/:id', authenticate, authorize('instructor', 'admin'), deleteLesson);
router.post('/lessons/:id/complete', authenticate, authorize('student'), markLessonComplete);

export default router;
