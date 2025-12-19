import Assignment from '../models/Assignment.js';
import { Lesson, Section } from '../models/Curriculum.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import pool from '../config/database.js';

export const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, max_points, due_date } = req.body;
  const lesson_id = req.params.id;

  // Verify lesson exists and user owns the course
  const lesson = await Lesson.findById(lesson_id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  const section = await Section.findById(lesson.section_id);
  const course = await Course.findById(section.course_id);

  if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const assignment = await Assignment.create({
    lesson_id,
    title,
    description,
    max_points,
    due_date
  });

  res.status(201).json({
    message: 'Assignment created successfully',
    assignment
  });
});

export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  // If student, also get their submission
  if (req.user.role === 'student') {
    const submission = await Assignment.getSubmission(req.params.id, req.user.id);
    return res.json({ assignment, submission });
  }

  // If instructor, get all submissions
  if (req.user.role === 'instructor' || req.user.role === 'admin') {
    const submissions = await Assignment.getAssignmentSubmissions(req.params.id);
    return res.json({ assignment, submissions });
  }

  res.json({ assignment });
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const { content, file_url } = req.body;
  const assignment_id = req.params.id;

  const assignment = await Assignment.findById(assignment_id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  // Verify enrollment
  const lesson = await Lesson.findById(assignment.lesson_id);
  const section = await Section.findById(lesson.section_id);
  const enrollment = await Enrollment.findByStudentAndCourse(req.user.id, section.course_id);

  if (!enrollment) {
    return res.status(403).json({ error: 'Not enrolled in this course' });
  }

  const submission = await Assignment.submitAssignment({
    assignment_id,
    student_id: req.user.id,
    content,
    file_url
  });

  res.status(201).json({
    message: 'Assignment submitted successfully',
    submission
  });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback } = req.body;
  const submission_id = req.params.id;

  const submission = await Assignment.getSubmissionById(submission_id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  // Verify instructor owns the course
  const assignment = await Assignment.findById(submission.assignment_id);
  const lesson = await Lesson.findById(assignment.lesson_id);
  const section = await Section.findById(lesson.section_id);
  const course = await Course.findById(section.course_id);

  if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const gradedSubmission = await Assignment.gradeSubmission(submission_id, { grade, feedback });

  res.json({
    message: 'Submission graded successfully',
    submission: gradedSubmission
  });
});

// Get assignment grades for student
export const getAssignmentGrades = asyncHandler(async (req, res) => {
  const student_id = req.user.id;
  const { course_id } = req.query;

  // Get assignment grades
  let assignmentQuery = `
    SELECT asub.*, a.title as assignment_title, a.max_score, a.due_date,
           l.title as lesson_title, c.title as course_title, c.id as course_id,
           u.full_name as grader_name, 'assignment' as grade_type,
           asub.submitted_at as completed_at
    FROM assignment_submissions asub
    JOIN assignments a ON asub.assignment_id = a.id
    JOIN lessons l ON a.lesson_id = l.id
    JOIN sections s ON l.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    LEFT JOIN users u ON asub.graded_by = u.id
    WHERE asub.student_id = $1
  `;

  const params = [student_id];

  if (course_id) {
    assignmentQuery += ' AND c.id = $2';
  }

  // Get quiz grades
  let quizQuery = `
    SELECT qa.id, qa.score as grade, qa.total_points as max_score, qa.percentage,
           qa.passed, qa.completed_at, qa.started_at as submitted_at,
           q.title as assignment_title, q.passing_score,
           l.title as lesson_title, c.title as course_title, c.id as course_id,
           'quiz' as grade_type, NULL as feedback, NULL as grader_name, NULL as graded_at
    FROM quiz_attempts qa
    JOIN enrollments e ON qa.enrollment_id = e.id
    JOIN quizzes q ON qa.quiz_id = q.id
    JOIN lessons l ON q.lesson_id = l.id
    JOIN sections s ON l.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    WHERE e.student_id = $1 AND qa.completed_at IS NOT NULL
  `;

  if (course_id) {
    quizQuery += ' AND c.id = $2';
  }

  // Execute both queries
  const [assignmentResult, quizResult] = await Promise.all([
    pool.query(assignmentQuery, params.length > 1 ? params : [student_id]),
    pool.query(quizQuery, params.length > 1 ? params : [student_id])
  ]);

  // Combine and sort by date
  const allGrades = [...assignmentResult.rows, ...quizResult.rows]
    .sort((a, b) => new Date(b.submitted_at || b.completed_at) - new Date(a.submitted_at || a.completed_at));

  res.json({ grades: allGrades });
});

// Get lesson resources
export const getLessonResources = asyncHandler(async (req, res) => {
  const { lesson_id } = req.params;

  const result = await pool.query(
    'SELECT * FROM resources WHERE lesson_id = $1 ORDER BY created_at DESC',
    [lesson_id]
  );

  res.json({ resources: result.rows });
});
