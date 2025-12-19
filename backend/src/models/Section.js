import pool from '../config/database.js';

class Section {
  static async create({ course_id, title, description, order_index }) {
    const result = await pool.query(
      `INSERT INTO sections (course_id, title, description, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [course_id, title, description, order_index]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT s.*, 
              COUNT(l.id) as lesson_count,
              COALESCE(SUM(l.duration), 0) as total_duration
       FROM sections s
       LEFT JOIN lessons l ON s.id = l.section_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [id]
    );
    return result.rows[0];
  }

  static async findByCourseId(courseId) {
    const result = await pool.query(
      `SELECT s.*, 
              COUNT(l.id) as lesson_count,
              COALESCE(SUM(l.duration), 0) as total_duration
       FROM sections s
       LEFT JOIN lessons l ON s.id = l.section_id
       WHERE s.course_id = $1
       GROUP BY s.id
       ORDER BY s.order_index`,
      [courseId]
    );
    return result.rows;
  }

  static async update(id, { title, description, order_index }) {
    const result = await pool.query(
      `UPDATE sections 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           order_index = COALESCE($3, order_index)
       WHERE id = $4
       RETURNING *`,
      [title, description, order_index, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM sections WHERE id = $1', [id]);
  }

  static async reorder(courseId, sections) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < sections.length; i++) {
        await client.query(
          'UPDATE sections SET order_index = $1 WHERE id = $2 AND course_id = $3',
          [i, sections[i].id, courseId]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default Section;
