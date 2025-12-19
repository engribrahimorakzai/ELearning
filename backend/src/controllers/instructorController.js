import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get course analytics
export const getCourseAnalytics = asyncHandler(async (req, res) => {
  const { course_id } = req.params;
  const instructor_id = req.user.id;

  // Verify ownership
  const course = await pool.query(
    'SELECT * FROM courses WHERE id = $1 AND instructor_id = $2',
    [course_id, instructor_id]
  );

  if (course.rows.length === 0 && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const [
    enrollmentStats,
    completionStats,
    revenueStats,
    ratingStats,
    enrollmentTrend,
    completionRate
  ] = await Promise.all([
    pool.query('SELECT COUNT(*) as total FROM enrollments WHERE course_id = $1', [course_id]),
    pool.query('SELECT COUNT(*) as completed FROM enrollments WHERE course_id = $1 AND progress = 100', [course_id]),
    pool.query('SELECT price FROM courses WHERE id = $1', [course_id]),
    pool.query('SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE course_id = $1', [course_id]),
    pool.query(`
      SELECT DATE_TRUNC('day', enrolled_at) as date, COUNT(*) as enrollments
      FROM enrollments
      WHERE course_id = $1 AND enrolled_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', enrolled_at)
      ORDER BY date ASC
    `, [course_id]),
    pool.query(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN progress >= 25 THEN 1 END) as students_25,
        COUNT(CASE WHEN progress >= 50 THEN 1 END) as students_50,
        COUNT(CASE WHEN progress >= 75 THEN 1 END) as students_75,
        COUNT(CASE WHEN progress = 100 THEN 1 END) as students_100
      FROM enrollments
      WHERE course_id = $1
    `, [course_id])
  ]);

  const totalEnrollments = parseInt(enrollmentStats.rows[0].total);
  const price = parseFloat(revenueStats.rows[0].price);
  const revenue = totalEnrollments * price;

  res.json({
    analytics: {
      totalEnrollments,
      completedStudents: parseInt(completionStats.rows[0].completed),
      revenue,
      averageRating: parseFloat(ratingStats.rows[0].avg_rating || 0),
      totalReviews: parseInt(ratingStats.rows[0].total_reviews),
      enrollmentTrend: enrollmentTrend.rows,
      completionDistribution: completionRate.rows[0]
    }
  });
});

// Get student progress for a course
export const getStudentProgress = asyncHandler(async (req, res) => {
  const { course_id } = req.params;
  const instructor_id = req.user.id;

  // Verify ownership
  const course = await pool.query(
    'SELECT * FROM courses WHERE id = $1 AND instructor_id = $2',
    [course_id, instructor_id]
  );

  if (course.rows.length === 0 && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const result = await pool.query(
    `SELECT e.*, u.full_name, u.email, u.avatar_url,
            (SELECT COUNT(*) FROM lesson_progress lp 
             JOIN lessons l ON lp.lesson_id = l.id
             JOIN sections s ON l.section_id = s.id
             WHERE lp.enrollment_id = e.id AND lp.completed = true) as completed_lessons,
            (SELECT COUNT(*) FROM lessons l
             JOIN sections s ON l.section_id = s.id
             WHERE s.course_id = $1) as total_lessons
     FROM enrollments e
     JOIN users u ON e.student_id = u.id
     WHERE e.course_id = $1
     ORDER BY e.enrolled_at DESC`,
    [course_id]
  );

  res.json({ students: result.rows });
});

// Get earnings data
export const getEarningsData = asyncHandler(async (req, res) => {
  const instructor_id = req.user.id;
  const { period = '30' } = req.query; // days

  const [
    totalEarnings,
    monthlyBreakdown,
    courseBreakdown
  ] = await Promise.all([
    pool.query(`
      SELECT COALESCE(SUM(c.price), 0) as total
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.instructor_id = $1
    `, [instructor_id]),
    pool.query(`
      SELECT DATE_TRUNC('month', e.enrolled_at) as month,
             SUM(c.price) as earnings,
             COUNT(*) as enrollments
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.instructor_id = $1 
        AND e.enrolled_at >= NOW() - INTERVAL '${period} days'
      GROUP BY DATE_TRUNC('month', e.enrolled_at)
      ORDER BY month DESC
    `, [instructor_id]),
    pool.query(`
      SELECT c.id, c.title, c.price,
             COUNT(e.id) as enrollments,
             (c.price * COUNT(e.id)) as revenue
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.instructor_id = $1
      GROUP BY c.id, c.title, c.price
      ORDER BY revenue DESC
    `, [instructor_id])
  ]);

  res.json({
    earnings: {
      total: parseFloat(totalEarnings.rows[0].total),
      monthlyBreakdown: monthlyBreakdown.rows,
      courseBreakdown: courseBreakdown.rows
    }
  });
});

// Respond to review
export const respondToReview = asyncHandler(async (req, res) => {
  const { review_id } = req.params;
  const { response } = req.body;
  const instructor_id = req.user.id;

  // Verify the review is for instructor's course
  const review = await pool.query(
    `SELECT r.*, c.instructor_id
     FROM reviews r
     JOIN courses c ON r.course_id = c.id
     WHERE r.id = $1`,
    [review_id]
  );

  if (review.rows.length === 0) {
    return res.status(404).json({ error: 'Review not found' });
  }

  if (review.rows[0].instructor_id !== instructor_id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // Add instructor_response column if not exists (we'll update schema)
  const result = await pool.query(
    `UPDATE reviews 
     SET instructor_response = $1, 
         response_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [response, review_id]
  );

  res.json({
    message: 'Response added successfully',
    review: result.rows[0]
  });
});
