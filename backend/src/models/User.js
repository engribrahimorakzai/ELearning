import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async create({ email, password, full_name, role, bio = null, avatar_url = null }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, role, bio, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, role, bio, avatar_url, is_verified, created_at`,
      [email, hashedPassword, full_name, role, bio, avatar_url]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, full_name, role, bio, avatar_url, is_verified, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async update(id, { full_name, bio, avatar_url }) {
    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           bio = COALESCE($2, bio),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, full_name, role, bio, avatar_url, is_verified, created_at`,
      [full_name, bio, avatar_url, id]
    );
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateVerificationStatus(id, isVerified) {
    await pool.query(
      'UPDATE users SET is_verified = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [isVerified, id]
    );
  }
}

export default User;
