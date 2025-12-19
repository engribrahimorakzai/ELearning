import pool from '../config/database.js';

class Enrollment {
  static async create(student_id, course_id) {
    const result = await pool.query(
      `INSERT INTO enrollments (student_id, course_id)
       VALUES ($1, $2)
       RETURNING *`,
      [student_id, course_id]
    );
    return result.rows[0];
  }

  static async findByStudentAndCourse(student_id, course_id) {
    const result = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [student_id, course_id]
    );
    return result.rows[0];
  }

  static async getStudentCourses(student_id) {
    const result = await pool.query(
      `SELECT c.*, e.enrolled_at, e.progress, e.completed_at,
              u.full_name as instructor_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON c.instructor_id = u.id
       WHERE e.student_id = $1
       ORDER BY e.enrolled_at DESC`,
      [student_id]
    );
    return result.rows;
  }

  static async updateProgress(enrollment_id) {
    // Calculate progress based on completed lessons
    const result = await pool.query(
      `WITH total_lessons AS (
         SELECT COUNT(*) as total
         FROM lessons l
         JOIN sections s ON l.section_id = s.id
         JOIN enrollments e ON s.course_id = e.course_id
         WHERE e.id = $1
       ),
       completed_lessons AS (
         SELECT COUNT(*) as completed
         FROM lesson_progress lp
         WHERE lp.enrollment_id = $1 AND lp.completed = true
       )
       UPDATE enrollments
       SET progress = CASE 
         WHEN (SELECT total FROM total_lessons) = 0 THEN 0
         ELSE ROUND((SELECT completed FROM completed_lessons)::numeric / (SELECT total FROM total_lessons) * 100)
       END,
       completed_at = CASE
         WHEN (SELECT total FROM total_lessons) > 0 
              AND (SELECT completed FROM completed_lessons) >= (SELECT total FROM total_lessons)
              AND completed_at IS NULL
         THEN CURRENT_TIMESTAMP
         ELSE completed_at
       END
       WHERE id = $1
       RETURNING progress, completed_at`,
      [enrollment_id]
    );
    return result.rows[0];
  }

  static async getProgress(enrollment_id) {
    const result = await pool.query(
      `SELECT e.*, c.title as course_title,
              (SELECT COUNT(*) 
               FROM lessons l
               JOIN sections s ON l.section_id = s.id
               WHERE s.course_id = e.course_id) as total_lessons,
              (SELECT COUNT(*)
               FROM lesson_progress lp
               WHERE lp.enrollment_id = e.id 
                 AND lp.completed = true) as completed_lessons
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.id = $1`,
      [enrollment_id]
    );
    return result.rows[0];
  }

  static async markComplete(enrollment_id, certificate_url) {
    const result = await pool.query(
      `UPDATE enrollments
       SET completed_at = CURRENT_TIMESTAMP,
           progress = 100,
           certificate_url = $2
       WHERE id = $1
       RETURNING *`,
      [enrollment_id, certificate_url]
    );
    return result.rows[0];
  }
}

export default Enrollment;
