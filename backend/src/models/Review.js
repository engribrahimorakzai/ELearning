import pool from '../config/database.js';

class Review {
  static async create({ course_id, student_id, rating, review }) {
    const result = await pool.query(
      `INSERT INTO reviews (course_id, student_id, rating, review)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [course_id, student_id, rating, review]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT r.*, u.full_name as student_name, u.avatar_url as student_avatar
       FROM reviews r
       JOIN users u ON r.student_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByStudentAndCourse(student_id, course_id) {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE student_id = $1 AND course_id = $2',
      [student_id, course_id]
    );
    return result.rows[0];
  }

  static async getCourseReviews(course_id, limit = 10, offset = 0) {
    const result = await pool.query(
      `SELECT r.*, u.full_name as student_name, u.avatar_url as student_avatar
       FROM reviews r
       JOIN users u ON r.student_id = u.id
       WHERE r.course_id = $1
       ORDER BY r.helpful_count DESC, r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [course_id, limit, offset]
    );
    return result.rows;
  }

  static async update(id, { rating, review }) {
    const result = await pool.query(
      `UPDATE reviews
       SET rating = COALESCE($1, rating),
           review = COALESCE($2, review),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [rating, review, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
  }

  static async incrementHelpfulCount(review_id) {
    const result = await pool.query(
      `UPDATE reviews
       SET helpful_count = helpful_count + 1
       WHERE id = $1
       RETURNING *`,
      [review_id]
    );
    return result.rows[0];
  }
}

export default Review;
