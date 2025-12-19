import { Section, Lesson } from '../models/Curriculum.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Section Controllers
export const createSection = asyncHandler(async (req, res) => {
  const { title, description, order_index } = req.body;
  const course_id = req.params.id;

  // Verify course ownership
  const course = await Course.findById(course_id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const section = await Section.create({ course_id, title, description, order_index });

  res.status(201).json({
    message: 'Section created successfully',
    section
  });
});

export const updateSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);

  if (!section) {
    return res.status(404).json({ error: 'Section not found' });
  }

  // Verify course ownership
  const course = await Course.findById(section.course_id);
  if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const updatedSection = await Section.update(req.params.id, req.body);

  res.json({
    message: 'Section updated successfully',
    section: updatedSection
  });
});

export const deleteSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);

  if (!section) {
    return res.status(404).json({ error: 'Section not found' });
  }

  // Verify course ownership
  const course = await Course.findById(section.course_id);
  if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  await Section.delete(req.params.id);

  res.json({ message: 'Section deleted successfully' });
});

// Lesson Controllers
export const createLesson = asyncHandler(async (req, res) => {
  const { title, text_content, content_type, video_url, duration, order_index, is_preview } = req.body;
  const section_id = req.params.id;

  // Verify section exists and user owns the course
  const section = await Section.findById(section_id);
  if (!section) {
    return res.status(404).json({ error: 'Section not found' });
  }

  const course = await Course.findById(section.course_id);
  if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const lesson = await Lesson.create({
    section_id,
    title,
    text_content,
    content_type,
    video_url,
    duration,
    order_index,
    is_preview
  });

  res.status(201).json({
    message: 'Lesson created successfully',
    lesson
  });
});

export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  res.json({ lesson });
});

export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  // Verify ownership
  const section = await Section.findById(lesson.section_id);
  const course = await Course.findById(section.course_id);
  
  if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const updatedLesson = await Lesson.update(req.params.id, req.body);

  res.json({
    message: 'Lesson updated successfully',
    lesson: updatedLesson
  });
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  // Verify ownership
  const section = await Section.findById(lesson.section_id);
  const course = await Course.findById(section.course_id);
  
  if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  await Lesson.delete(req.params.id);

  res.json({ message: 'Lesson deleted successfully' });
});

export const markLessonComplete = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  // Verify enrollment
  const section = await Section.findById(lesson.section_id);
  const enrollment = await Enrollment.findByStudentAndCourse(req.user.id, section.course_id);

  if (!enrollment) {
    return res.status(403).json({ error: 'Not enrolled in this course' });
  }

  await Lesson.markComplete(enrollment.id, req.params.id);

  // Update enrollment progress
  await Enrollment.updateProgress(enrollment.id);

  res.json({ 
    message: 'Lesson marked as complete',
    enrollment_id: enrollment.id,
    lesson_id: req.params.id
  });
});
