import pool from '../config/database.js';

class LessonProgress {
  static async create({ enrollment_id, lesson_id, completed = false }) {
    const result = await pool.query(
      `INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, completed_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (enrollment_id, lesson_id)
       DO UPDATE SET completed = $3, completed_at = $4
       RETURNING *`,
      [enrollment_id, lesson_id, completed, completed ? new Date() : null]
    );
    return result.rows[0];
  }

  static async findByEnrollmentAndLesson(enrollmentId, lessonId) {
    const result = await pool.query(
      'SELECT * FROM lesson_progress WHERE enrollment_id = $1 AND lesson_id = $2',
      [enrollmentId, lessonId]
    );
    return result.rows[0];
  }

  static async findByEnrollment(enrollmentId) {
    const result = await pool.query(
      `SELECT lp.*, l.title, l.duration, l.content_type, s.title as section_title
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       JOIN sections s ON l.section_id = s.id
       WHERE lp.enrollment_id = $1
       ORDER BY s.order_index, l.order_index`,
      [enrollmentId]
    );
    return result.rows;
  }

  static async getCompletionStats(enrollmentId) {
    const result = await pool.query(
      `SELECT 
         COUNT(*) as total_lessons,
         COUNT(*) FILTER (WHERE lp.completed = true) as completed_lessons,
         ROUND((COUNT(*) FILTER (WHERE lp.completed = true)::decimal / COUNT(*)) * 100, 2) as completion_percentage
       FROM lessons l
       JOIN sections s ON l.section_id = s.id
       JOIN courses c ON s.course_id = c.id
       JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.enrollment_id = e.id
       WHERE e.id = $1`,
      [enrollmentId]
    );
    return result.rows[0];
  }
}

export default LessonProgress;
