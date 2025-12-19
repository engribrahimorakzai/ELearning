import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAllUsers,
  deleteUser,
  updateUser,
  verifyInstructor,
  getAllCourses,
  updateCourse,
  deleteCourse,
  approveCourse,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPlatformStats,
  getAllLessons,
  updateLesson,
  deleteLesson
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/verify', verifyInstructor);

// Course Management
router.get('/courses', getAllCourses);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.put('/courses/:id/approve', approveCourse);

// Lesson Management
router.get('/lessons', getAllLessons);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

// Category Management
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Platform Stats
router.get('/stats', getPlatformStats);

export default router;
