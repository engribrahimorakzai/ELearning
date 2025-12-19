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
    const result = await pool.query('SELECT * FROM sections WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, { title, description, order_index }) {
    const result = await pool.query(
      `UPDATE sections
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           order_index = COALESCE($3, order_index),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, description, order_index, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM sections WHERE id = $1', [id]);
  }
}

class Lesson {
  static async create({ section_id, title, text_content, content_type, video_url, duration, order_index, is_preview = false }) {
    const result = await pool.query(
      `INSERT INTO lessons (section_id, title, text_content, content_type, video_url, duration, order_index, is_preview)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [section_id, title, text_content, content_type, video_url, duration, order_index, is_preview]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT l.*, 
              q.id as quiz_id,
              a.id as assignment_id,
              (SELECT json_agg(r.*) FROM resources r WHERE r.lesson_id = l.id) as resources
       FROM lessons l
       LEFT JOIN quizzes q ON l.id = q.lesson_id
       LEFT JOIN assignments a ON l.id = a.lesson_id
       WHERE l.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await pool.query(
      `UPDATE lessons SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM lessons WHERE id = $1', [id]);
  }

  static async markComplete(enrollment_id, lesson_id) {
    const result = await pool.query(
      `INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, completed_at)
       VALUES ($1, $2, true, CURRENT_TIMESTAMP)
       ON CONFLICT (enrollment_id, lesson_id)
       DO UPDATE SET completed = true, completed_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [enrollment_id, lesson_id]
    );
    return result.rows[0];
  }

  static async addResource(lesson_id, { title, file_url, file_type, file_size }) {
    const result = await pool.query(
      `INSERT INTO resources (lesson_id, title, file_url, file_type, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lesson_id, title, file_url, file_type, file_size]
    );
    return result.rows[0];
  }
}

export { Section, Lesson };
