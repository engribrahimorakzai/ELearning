import { body, param, query, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validation
export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('role').isIn(['student', 'instructor', 'admin']).withMessage('Invalid role'),
  body('bio').optional().trim(),
  validate
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Course validation
export const createCourseValidation = [
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('description').trim().notEmpty().withMessage('Course description is required'),
  body('category_id').optional().isInt().withMessage('Invalid category ID'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  validate
];

export const updateCourseValidation = [
  param('id').isInt().withMessage('Invalid course ID'),
  body('title').optional().trim().notEmpty().withMessage('Course title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Course description cannot be empty'),
  body('category_id').optional().isInt().withMessage('Invalid category ID'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  validate
];

// Section validation
export const createSectionValidation = [
  param('id').isInt().withMessage('Invalid course ID'),
  body('title').trim().notEmpty().withMessage('Section title is required'),
  body('description').optional().trim(),
  body('order_index').isInt({ min: 0 }).withMessage('Order index must be a non-negative integer'),
  validate
];

// Lesson validation
export const createLessonValidation = [
  param('id').isInt().withMessage('Invalid section ID'),
  body('title').trim().notEmpty().withMessage('Lesson title is required'),
  body('content').optional().trim(),
  body('lesson_type').isIn(['video', 'text', 'quiz', 'assignment']).withMessage('Invalid lesson type'),
  body('video_url').optional().isURL().withMessage('Invalid video URL'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer'),
  body('order_index').isInt({ min: 0 }).withMessage('Order index must be a non-negative integer'),
  validate
];

// Quiz validation
export const createQuizValidation = [
  param('id').isInt().withMessage('Invalid lesson ID'),
  body('title').trim().notEmpty().withMessage('Quiz title is required'),
  body('description').optional().trim(),
  body('passing_score').optional().isInt({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
  body('time_limit').optional().isInt({ min: 0 }).withMessage('Time limit must be a positive integer'),
  validate
];

export const submitQuizValidation = [
  param('id').isInt().withMessage('Invalid quiz ID'),
  body('answers').isObject().withMessage('Answers must be an object'),
  validate
];

// Assignment validation
export const createAssignmentValidation = [
  param('id').isInt().withMessage('Invalid lesson ID'),
  body('title').trim().notEmpty().withMessage('Assignment title is required'),
  body('description').optional().trim(),
  body('max_points').optional().isInt({ min: 0 }).withMessage('Max points must be a positive integer'),
  body('due_date').optional().isISO8601().withMessage('Invalid due date format'),
  validate
];

export const gradeSubmissionValidation = [
  param('id').isInt().withMessage('Invalid submission ID'),
  body('grade').isInt({ min: 0 }).withMessage('Grade must be a non-negative integer'),
  body('feedback').optional().trim(),
  validate
];

// Review validation
export const createReviewValidation = [
  param('id').isInt().withMessage('Invalid course ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim(),
  validate
];

// Query validation
export const coursesQueryValidation = [
  query('search').optional().trim(),
  query('category_id').optional().isInt().withMessage('Invalid category ID'),
  query('min_price').optional().isFloat({ min: 0 }).withMessage('Invalid min price'),
  query('max_price').optional().isFloat({ min: 0 }).withMessage('Invalid max price'),
  query('min_rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Invalid min rating'),
  query('sort').optional().isIn(['rating', 'popularity', 'price_low', 'price_high', 'newest']).withMessage('Invalid sort option'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Invalid offset'),
  validate
];
