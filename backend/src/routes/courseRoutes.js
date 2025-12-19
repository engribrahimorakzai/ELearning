import express from 'express';
import {
  browseCourses,
  getCourseDetails,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getCourseCurriculum,
  getMyCourses,
  getMyTeaching
} from '../controllers/courseController.js';
import { getCategories } from '../controllers/adminController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import {
  createCourseValidation,
  updateCourseValidation,
  coursesQueryValidation
} from '../middleware/validation.js';

const router = express.Router();

router.get('/', coursesQueryValidation, optionalAuth, browseCourses);
router.get('/categories', getCategories);
router.get('/my-courses', authenticate, authorize('student'), getMyCourses);
router.get('/my-teaching', authenticate, authorize('instructor', 'admin'), getMyTeaching);
router.get('/:id', optionalAuth, getCourseDetails);
router.post('/', authenticate, authorize('instructor', 'admin'), createCourseValidation, createCourse);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateCourseValidation, updateCourse);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteCourse);
router.post('/:id/enroll', authenticate, authorize('student'), enrollCourse);
router.get('/:id/curriculum', optionalAuth, getCourseCurriculum);

export default router;
