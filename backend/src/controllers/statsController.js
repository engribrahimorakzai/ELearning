import pool from '../config/database.js';

// Get platform statistics
export const getPlatformStats = async (req, res) => {
  try {
    // Get total students
    const studentsResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'student'"
    );

    // Get total instructors
    const instructorsResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'instructor'"
    );

    // Get total courses
    const coursesResult = await pool.query(
      'SELECT COUNT(*) as count FROM courses WHERE status = $1',
      ['published']
    );

    // Get total enrollments
    const enrollmentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM enrollments'
    );

    // Get total course completions (certificates earned)
    const certificatesResult = await pool.query(
      'SELECT COUNT(*) as count FROM enrollments WHERE completed_at IS NOT NULL'
    );

    // Get total lessons
    const lessonsResult = await pool.query(
      'SELECT COUNT(*) as count FROM lessons'
    );

    // Get average course rating
    const avgRatingResult = await pool.query(
      'SELECT AVG(rating) as avg_rating FROM reviews'
    );

    const stats = {
      students: parseInt(studentsResult.rows[0].count),
      instructors: parseInt(instructorsResult.rows[0].count),
      courses: parseInt(coursesResult.rows[0].count),
      enrollments: parseInt(enrollmentsResult.rows[0].count),
      certificates: parseInt(certificatesResult.rows[0].count),
      lessons: parseInt(lessonsResult.rows[0].count),
      avgRating: parseFloat(avgRatingResult.rows[0].avg_rating || 0).toFixed(1)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ error: 'Failed to fetch platform statistics' });
  }
};

// Get enrollment trend data (monthly)
export const getEnrollmentTrend = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    // Get enrollments grouped by month for the last N months
    const result = await pool.query(`
      SELECT 
        TO_CHAR(enrolled_at, 'Mon') as month,
        COUNT(*) as enrollments,
        EXTRACT(MONTH FROM enrolled_at) as month_num
      FROM enrollments
      WHERE enrolled_at >= NOW() - INTERVAL '${parseInt(months)} months'
      GROUP BY TO_CHAR(enrolled_at, 'Mon'), EXTRACT(MONTH FROM enrolled_at)
      ORDER BY month_num
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching enrollment trend:', error);
    res.status(500).json({ error: 'Failed to fetch enrollment trend data' });
  }
};

// Get admin analytics
export const getAdminAnalytics = async (req, res) => {
  try {
    // Get basic stats
    const studentsResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'student'"
    );
    const instructorsResult = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'instructor' AND is_verified = true"
    );
    const coursesResult = await pool.query(
      'SELECT COUNT(*) as count FROM courses WHERE status = $1',
      ['published']
    );
    const revenueResult = await pool.query(
      'SELECT COALESCE(SUM(c.price), 0) as total FROM enrollments e JOIN courses c ON e.course_id = c.id'
    );

    // Get enrollment trend for last 6 months
    const enrollmentTrend = await pool.query(`
      SELECT 
        TO_CHAR(enrolled_at, 'Mon') as month,
        COUNT(*) as enrollments,
        EXTRACT(MONTH FROM enrolled_at) as month_num
      FROM enrollments
      WHERE enrolled_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(enrolled_at, 'Mon'), EXTRACT(MONTH FROM enrolled_at)
      ORDER BY month_num
    `);

    // Get course progress distribution
    const progressDist = await pool.query(`
      SELECT 
        CASE 
          WHEN progress = 100 THEN 'Completed'
          WHEN progress > 0 THEN 'In Progress'
          ELSE 'Not Started'
        END as status,
        COUNT(*) as count
      FROM enrollments
      GROUP BY 
        CASE 
          WHEN progress = 100 THEN 'Completed'
          WHEN progress > 0 THEN 'In Progress'
          ELSE 'Not Started'
        END
    `);

    // Get monthly activity (enrollments + completions)
    const monthlyActivity = await pool.query(`
      SELECT 
        TO_CHAR(date_trunc('month', enrolled_at), 'Mon') as month,
        COUNT(*) as enrollments,
        COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completions,
        EXTRACT(MONTH FROM enrolled_at) as month_num
      FROM enrollments
      WHERE enrolled_at >= NOW() - INTERVAL '6 months'
      GROUP BY date_trunc('month', enrolled_at), EXTRACT(MONTH FROM enrolled_at)
      ORDER BY month_num
    `);

    const stats = {
      totalStudents: parseInt(studentsResult.rows[0].count),
      totalInstructors: parseInt(instructorsResult.rows[0].count),
      totalCourses: parseInt(coursesResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total || 0).toFixed(2),
      enrollmentTrend: enrollmentTrend.rows,
      progressDistribution: progressDist.rows.map(row => ({
        name: row.status,
        value: parseInt(row.count)
      })),
      monthlyActivity: monthlyActivity.rows
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: 'Failed to fetch admin analytics' });
  }
};
