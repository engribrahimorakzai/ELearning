import pool from '../config/database.js';
import { generateSlug, makeUniqueSlug } from '../utils/helpers.js';

class Course {
  static async create({ instructor_id, title, description, category_id, level, price, thumbnail, status = 'draft' }) {
    let slug = generateSlug(title);
    
    // Check if slug exists
    const existingSlug = await pool.query('SELECT id FROM courses WHERE slug = $1', [slug]);
    if (existingSlug.rows.length > 0) {
      slug = makeUniqueSlug(slug);
    }
    
    const result = await pool.query(
      `INSERT INTO courses (instructor_id, title, slug, description, category_id, level, price, thumbnail, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [instructor_id, title, slug, description, category_id, level, price, thumbnail, status]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT c.*, u.full_name as instructor_name, cat.name as category_name,
              COUNT(DISTINCT e.id) as enrollment_count,
              AVG(r.rating) as average_rating,
              COUNT(DISTINCT r.id) as review_count
       FROM courses c
       LEFT JOIN users u ON c.instructor_id = u.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN reviews r ON c.id = r.course_id
       WHERE c.id = $1
       GROUP BY c.id, u.full_name, cat.name`,
      [id]
    );
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT c.*, u.full_name as instructor_name, cat.name as category_name,
             COUNT(DISTINCT e.id) as enrollment_count,
             AVG(r.rating) as average_rating,
             COUNT(DISTINCT r.id) as review_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.status = 'published'
    `;
    
    const params = [];
    let paramIndex = 1;

    if (filters.search) {
      query += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (filters.category_id) {
      query += ` AND c.category_id = $${paramIndex}`;
      params.push(filters.category_id);
      paramIndex++;
    }

    if (filters.min_price !== undefined) {
      query += ` AND c.price >= $${paramIndex}`;
      params.push(filters.min_price);
      paramIndex++;
    }

    if (filters.max_price !== undefined) {
      query += ` AND c.price <= $${paramIndex}`;
      params.push(filters.max_price);
      paramIndex++;
    }

    if (filters.is_featured) {
      query += ` AND c.is_featured = true`;
    }

    query += ` GROUP BY c.id, u.full_name, cat.name`;

    if (filters.min_rating) {
      query += ` HAVING AVG(r.rating) >= ${filters.min_rating}`;
    }

    // Sorting
    if (filters.sort === 'rating') {
      query += ` ORDER BY average_rating DESC NULLS LAST`;
    } else if (filters.sort === 'popularity') {
      query += ` ORDER BY enrollment_count DESC`;
    } else if (filters.sort === 'price_low') {
      query += ` ORDER BY c.price ASC`;
    } else if (filters.sort === 'price_high') {
      query += ` ORDER BY c.price DESC`;
    } else {
      query += ` ORDER BY c.created_at DESC`;
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await pool.query(query, params);
    return result.rows;
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
      `UPDATE courses SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM courses WHERE id = $1', [id]);
  }

  static async getInstructorCourses(instructorId) {
    const result = await pool.query(
      `SELECT c.*, COUNT(DISTINCT e.id) as enrollment_count,
              AVG(r.rating) as average_rating,
              COUNT(DISTINCT r.id) as review_count
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN reviews r ON c.id = r.course_id
       WHERE c.instructor_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [instructorId]
    );
    return result.rows;
  }

  static async getCurriculum(courseId) {
    const sections = await pool.query(
      `SELECT * FROM sections WHERE course_id = $1 ORDER BY order_index`,
      [courseId]
    );

    for (let section of sections.rows) {
      const lessons = await pool.query(
        `SELECT l.*, 
                q.id as quiz_id,
                a.id as assignment_id
         FROM lessons l
         LEFT JOIN quizzes q ON l.id = q.lesson_id
         LEFT JOIN assignments a ON l.id = a.lesson_id
         WHERE l.section_id = $1 
         ORDER BY l.order_index`,
        [section.id]
      );
      section.lessons = lessons.rows;
    }

    return sections.rows;
  }
}

export default Course;
