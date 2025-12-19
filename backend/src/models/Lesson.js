import pool from '../config/database.js';

class Lesson {
  static async create({ section_id, title, content_type, video_url, text_content, duration, order_index, is_preview }) {
    const result = await pool.query(
      `INSERT INTO lessons (section_id, title, content_type, video_url, text_content, duration, order_index, is_preview)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [section_id, title, content_type, video_url, text_content, duration, order_index, is_preview || false]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT l.*, q.id as quiz_id, a.id as assignment_id
       FROM lessons l
       LEFT JOIN quizzes q ON l.id = q.lesson_id
       LEFT JOIN assignments a ON l.id = a.lesson_id
       WHERE l.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findBySectionId(sectionId) {
    const result = await pool.query(
      'SELECT * FROM lessons WHERE section_id = $1 ORDER BY order_index',
      [sectionId]
    );
    return result.rows;
  }

  static async update(id, { title, content_type, video_url, text_content, duration, order_index, is_preview }) {
    const result = await pool.query(
      `UPDATE lessons 
       SET title = COALESCE($1, title),
           content_type = COALESCE($2, content_type),
           video_url = COALESCE($3, video_url),
           text_content = COALESCE($4, text_content),
           duration = COALESCE($5, duration),
           order_index = COALESCE($6, order_index),
           is_preview = COALESCE($7, is_preview)
       WHERE id = $8
       RETURNING *`,
      [title, content_type, video_url, text_content, duration, order_index, is_preview, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM lessons WHERE id = $1', [id]);
  }

  static async markComplete(enrollmentId, lessonId) {
    const result = await pool.query(
      `INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, completed_at)
       VALUES ($1, $2, true, CURRENT_TIMESTAMP)
       ON CONFLICT (enrollment_id, lesson_id)
       DO UPDATE SET completed = true, completed_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [enrollmentId, lessonId]
    );
    return result.rows[0];
  }

  static async getProgress(enrollmentId, lessonId) {
    const result = await pool.query(
      'SELECT * FROM lesson_progress WHERE enrollment_id = $1 AND lesson_id = $2',
      [enrollmentId, lessonId]
    );
    return result.rows[0];
  }

  static async getAllProgressByEnrollment(enrollmentId) {
    const result = await pool.query(
      `SELECT lp.*, l.title, l.duration
       FROM lesson_progress lp
       JOIN lessons l ON lp.lesson_id = l.id
       WHERE lp.enrollment_id = $1`,
      [enrollmentId]
    );
    return result.rows;
  }
}

export default Lesson;
