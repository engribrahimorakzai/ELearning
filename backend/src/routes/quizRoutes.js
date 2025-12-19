import express from 'express';
import {
  createQuiz,
  getQuiz,
  startQuizAttempt,
  submitQuiz,
  getQuizResults,
  getQuizHistory
} from '../controllers/quizController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createQuizValidation, submitQuizValidation } from '../middleware/validation.js';

const router = express.Router();

router.post('/lessons/:id/quiz', authenticate, authorize('instructor', 'admin'), createQuizValidation, createQuiz);
router.get('/quizzes/:id', authenticate, getQuiz);
router.get('/quizzes/:id/questions', authenticate, getQuiz); // Returns quiz with questions
router.post('/quizzes/:id/attempt', authenticate, authorize('student'), startQuizAttempt);
router.post('/quizzes/:id/submit', authenticate, authorize('student'), submitQuiz);
router.get('/quizzes/:id/results', authenticate, getQuizResults);
router.get('/quiz-history', authenticate, authorize('student'), getQuizHistory);

export default router;
