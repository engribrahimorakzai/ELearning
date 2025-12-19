import pool from '../config/database.js';

class Resource {
  static async create({ lesson_id, title, file_url, file_size, file_type }) {
    const result = await pool.query(
      `INSERT INTO resources (lesson_id, title, file_url, file_size, file_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lesson_id, title, file_url, file_size, file_type]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM resources WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByLessonId(lessonId) {
    const result = await pool.query(
      'SELECT * FROM resources WHERE lesson_id = $1 ORDER BY created_at',
      [lessonId]
    );
    return result.rows;
  }

  static async update(id, { title, file_url, file_size, file_type }) {
    const result = await pool.query(
      `UPDATE resources 
       SET title = COALESCE($1, title),
           file_url = COALESCE($2, file_url),
           file_size = COALESCE($3, file_size),
           file_type = COALESCE($4, file_type)
       WHERE id = $5
       RETURNING *`,
      [title, file_url, file_size, file_type, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM resources WHERE id = $1', [id]);
  }
}

export default Resource;
