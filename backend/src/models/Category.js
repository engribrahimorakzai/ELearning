import pool from '../config/database.js';

class Category {
  static async create({ name, description, icon }) {
    const result = await pool.query(
      `INSERT INTO categories (name, description, icon)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, icon]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query(
      `SELECT c.*, COUNT(co.id) as course_count
       FROM categories c
       LEFT JOIN courses co ON c.id = co.category_id
       GROUP BY c.id
       ORDER BY c.name`
    );
    return result.rows;
  }

  static async update(id, { name, description, icon }) {
    const result = await pool.query(
      `UPDATE categories 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           icon = COALESCE($3, icon)
       WHERE id = $4
       RETURNING *`,
      [name, description, icon, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  }
}

export default Category;
