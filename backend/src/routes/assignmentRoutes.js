import express from 'express';
import {
  createAssignment,
  getAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentGrades,
  getLessonResources
} from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createAssignmentValidation, gradeSubmissionValidation } from '../middleware/validation.js';

const router = express.Router();

router.post('/lessons/:id/assignment', authenticate, authorize('instructor', 'admin'), createAssignmentValidation, createAssignment);
router.get('/assignments/:id', authenticate, getAssignment);
router.post('/assignments/:id/submit', authenticate, authorize('student'), submitAssignment);
router.put('/submissions/:id/grade', authenticate, authorize('instructor', 'admin'), gradeSubmissionValidation, gradeSubmission);
router.get('/assignment-grades', authenticate, authorize('student'), getAssignmentGrades);
router.get('/lessons/:lesson_id/resources', authenticate, getLessonResources);

export default router;
