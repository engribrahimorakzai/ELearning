import Enrollment from '../models/Enrollment.js';
import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getEnrollmentProgress = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.getProgress(req.params.id);

  if (!enrollment) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  // Only allow viewing own progress or instructor/admin
  if (enrollment.student_id !== req.user.id && req.user.role === 'student') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  res.json({ progress: enrollment });
});

export const getCertificate = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT 
      e.id as enrollment_id,
      e.completion_status,
      e.certificate_url,
      e.completed_at,
      e.student_id,
      u.full_name as student_name,
      c.title as course_title,
      c.instructor_id,
      i.full_name as instructor_name,
      e.enrolled_at
    FROM enrollments e
    JOIN users u ON e.student_id = u.id
    JOIN courses c ON e.course_id = c.id
    JOIN users i ON c.instructor_id = i.id
    WHERE e.id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  const enrollment = result.rows[0];

  if (enrollment.student_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  if (!enrollment.completed_at) {
    return res.status(400).json({ error: 'Course not completed yet' });
  }

  // Return certificate details
  res.json({
    certificate_url: enrollment.certificate_url || 'Certificate generation pending',
    certificate_data: {
      student_name: enrollment.student_name,
      course_title: enrollment.course_title,
      instructor_name: enrollment.instructor_name,
      completion_date: enrollment.completed_at,
      enrollment_date: enrollment.enrolled_at
    },
    completed_at: enrollment.completed_at
  });
});

export const getStudentDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  // Get enrolled courses count
  const enrolledCoursesResult = await pool.query(
    'SELECT COUNT(*) FROM enrollments WHERE student_id = $1',
    [studentId]
  );

  // Get completed courses count
  const completedCoursesResult = await pool.query(
    'SELECT COUNT(*) FROM enrollments WHERE student_id = $1 AND completed_at IS NOT NULL',
    [studentId]
  );

  // Get in-progress courses with lesson counts
  const inProgressCourses = await pool.query(
    `SELECT c.id, c.title, c.thumbnail, e.progress, e.enrolled_at,
            u.full_name as instructor_name,
            c.total_lessons,
            COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.completed = true) as completed_lessons
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     JOIN users u ON c.instructor_id = u.id
     LEFT JOIN sections s ON c.id = s.course_id
     LEFT JOIN lessons l ON s.id = l.section_id
     LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.enrollment_id = e.id
     WHERE e.student_id = $1 AND e.completed_at IS NULL
     GROUP BY c.id, c.title, c.thumbnail, e.progress, e.enrolled_at, u.full_name, c.total_lessons
     ORDER BY e.enrolled_at DESC
     LIMIT 5`,
    [studentId]
  );

  // Get recent quiz scores
  const recentQuizzes = await pool.query(
    `SELECT qa.id, qa.score, qa.percentage, qa.passed, qa.completed_at,
            q.id as quiz_id, q.title, c.title as course_title
     FROM quiz_attempts qa
     JOIN enrollments e ON qa.enrollment_id = e.id
     JOIN quizzes q ON qa.quiz_id = q.id
     JOIN lessons l ON q.lesson_id = l.id
     JOIN sections s ON l.section_id = s.id
     JOIN courses c ON s.course_id = c.id
     WHERE e.student_id = $1 AND qa.completed_at IS NOT NULL
     ORDER BY qa.completed_at DESC
     LIMIT 5`,
    [studentId]
  );

  // Get pending assignments
  const pendingAssignments = await pool.query(
    `SELECT a.*, l.title as lesson_title, c.title as course_title,
            CASE WHEN asub.id IS NULL THEN false ELSE true END as submitted
     FROM assignments a
     JOIN lessons l ON a.lesson_id = l.id
     JOIN sections s ON l.section_id = s.id
     JOIN courses c ON s.course_id = c.id
     JOIN enrollments e ON c.id = e.course_id
     LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = $1
     WHERE e.student_id = $1 AND (asub.id IS NULL OR asub.grade IS NULL)
     ORDER BY a.due_date ASC NULLS LAST
     LIMIT 5`,
    [studentId]
  );

  // Calculate in-progress courses count (enrolled but not completed)
  const enrolledCount = parseInt(enrolledCoursesResult.rows[0].count);
  const completedCount = parseInt(completedCoursesResult.rows[0].count);
  const inProgressCount = enrolledCount - completedCount;

  res.json({
    stats: {
      enrolled_courses: enrolledCount,
      completed_courses: completedCount,
      in_progress_courses: inProgressCount,
      certificates_earned: completedCount // certificates = completed courses
    },
    enrollments: inProgressCourses.rows,
    in_progress_courses: inProgressCourses.rows,
    recent_quizzes: recentQuizzes.rows,
    pending_assignments: pendingAssignments.rows
  });
});

export const getInstructorDashboard = asyncHandler(async (req, res) => {
  const instructorId = req.user.id;

  // Get total courses
  const totalCoursesResult = await pool.query(
    'SELECT COUNT(*) FROM courses WHERE instructor_id = $1',
    [instructorId]
  );

  // Get total students (enrollments)
  const totalStudentsResult = await pool.query(
    `SELECT COUNT(DISTINCT e.student_id)
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     WHERE c.instructor_id = $1`,
    [instructorId]
  );

  // Get average rating
  const avgRatingResult = await pool.query(
    `SELECT AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
     FROM reviews r
     JOIN courses c ON r.course_id = c.id
     WHERE c.instructor_id = $1`,
    [instructorId]
  );

  // Get course statistics
  const courseStats = await pool.query(
    `SELECT c.id, c.title, c.status,
            COUNT(DISTINCT e.id) as enrollment_count,
            AVG(r.rating) as average_rating,
            COUNT(DISTINCT r.id) as review_count
     FROM courses c
     LEFT JOIN enrollments e ON c.id = e.course_id
     LEFT JOIN reviews r ON c.id = r.course_id
     WHERE c.instructor_id = $1
     GROUP BY c.id, c.title, c.status
     ORDER BY enrollment_count DESC`,
    [instructorId]
  );

  // Get pending assignment submissions
  const pendingGrading = await pool.query(
    `SELECT asub.*, a.title as assignment_title, c.title as course_title,
            u.full_name as student_name
     FROM assignment_submissions asub
     JOIN assignments a ON asub.assignment_id = a.id
     JOIN lessons l ON a.lesson_id = l.id
     JOIN sections s ON l.section_id = s.id
     JOIN courses c ON s.course_id = c.id
     JOIN users u ON asub.student_id = u.id
     WHERE c.instructor_id = $1 AND asub.grade IS NULL
     ORDER BY asub.submitted_at DESC
     LIMIT 10`,
    [instructorId]
  );

  // Get recent enrollments
  const recentEnrollments = await pool.query(
    `SELECT e.*, c.title as course_title, u.full_name as student_name
     FROM enrollments e
     JOIN courses c ON e.course_id = c.id
     JOIN users u ON e.student_id = u.id
     WHERE c.instructor_id = $1
     ORDER BY e.enrolled_at DESC
     LIMIT 10`,
    [instructorId]
  );

  res.json({
    stats: {
      total_courses: parseInt(totalCoursesResult.rows[0].count),
      total_students: parseInt(totalStudentsResult.rows[0].count),
      average_rating: parseFloat(avgRatingResult.rows[0].avg_rating) || 0,
      total_reviews: parseInt(avgRatingResult.rows[0].review_count)
    },
    course_statistics: courseStats.rows,
    pending_grading: pendingGrading.rows,
    recent_enrollments: recentEnrollments.rows
  });
});
