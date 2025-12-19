import Review from '../models/Review.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const course_id = req.params.id;

  // Verify course exists
  const course = await Course.findById(course_id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // Verify enrollment
  const enrollment = await Enrollment.findByStudentAndCourse(req.user.id, course_id);
  if (!enrollment) {
    return res.status(403).json({ error: 'You must be enrolled to review this course' });
  }

  // Check if already reviewed
  const existingReview = await Review.findByStudentAndCourse(req.user.id, course_id);
  if (existingReview) {
    return res.status(409).json({ error: 'You have already reviewed this course' });
  }

  const review = await Review.create({
    course_id,
    student_id: req.user.id,
    rating,
    comment
  });

  res.status(201).json({
    message: 'Review created successfully',
    review
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  if (review.student_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to update this review' });
  }

  const updatedReview = await Review.update(req.params.id, { rating, comment });

  res.json({
    message: 'Review updated successfully',
    review: updatedReview
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  if (review.student_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this review' });
  }

  await Review.delete(req.params.id);

  res.json({ message: 'Review deleted successfully' });
});

export const voteReviewHelpful = asyncHandler(async (req, res) => {
  const { is_helpful } = req.body;

  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  await Review.voteHelpful(req.params.id, req.user.id, is_helpful);

  res.json({ message: 'Vote recorded successfully' });
});

export const getCourseReviews = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  const reviews = await Review.getCourseReviews(req.params.id, limit, offset);

  res.json({ reviews });
});
