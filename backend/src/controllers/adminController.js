import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all users with filters
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, is_verified, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT id, email, full_name, role, bio, avatar_url, is_verified, created_at FROM users WHERE 1=1';
  const params = [];
  let paramCount = 0;

  if (role) {
    paramCount++;
    query += ` AND role = $${paramCount}`;
    params.push(role);
  }

  if (is_verified !== undefined) {
    paramCount++;
    query += ` AND is_verified = $${paramCount}`;
    params.push(is_verified === 'true');
  }

  if (search) {
    paramCount++;
    query += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
    params.push(`%${search}%`);
  }

  query += ' ORDER BY created_at DESC';
  
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(limit);
  
  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const result = await pool.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
  const countParams = [];
  let countParamNum = 0;

  if (role) {
    countParamNum++;
    countQuery += ` AND role = $${countParamNum}`;
    countParams.push(role);
  }

  if (is_verified !== undefined) {
    countParamNum++;
    countQuery += ` AND is_verified = $${countParamNum}`;
    countParams.push(is_verified === 'true');
  }

  if (search) {
    countParamNum++;
    countQuery += ` AND (full_name ILIKE $${countParamNum} OR email ILIKE $${countParamNum})`;
    countParams.push(`%${search}%`);
  }

  const countResult = await pool.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);

  res.json({
    users: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ message: 'User deleted successfully' });
});

// Update user
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { full_name, email, role } = req.body;

  // Prevent changing own role
  if (parseInt(id) === req.user.id && role && role !== req.user.role) {
    return res.status(400).json({ error: 'Cannot change your own role' });
  }

  const updates = [];
  const params = [];
  let paramCount = 0;

  if (full_name) {
    paramCount++;
    updates.push(`full_name = $${paramCount}`);
    params.push(full_name);
  }

  if (email) {
    paramCount++;
    updates.push(`email = $${paramCount}`);
    params.push(email);
  }

  if (role) {
    paramCount++;
    updates.push(`role = $${paramCount}`);
    params.push(role);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  paramCount++;
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, full_name, role, is_verified`;
  
  const result = await pool.query(query, params);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    message: 'User updated successfully',
    user: result.rows[0]
  });
});

// Verify instructor
export const verifyInstructor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_verified } = req.body;

  const result = await pool.query(
    'UPDATE users SET is_verified = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND role = $3 RETURNING id, email, full_name, is_verified',
    [is_verified, id, 'instructor']
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Instructor not found' });
  }

  res.json({
    message: `Instructor ${is_verified ? 'verified' : 'unverified'} successfully`,
    user: result.rows[0]
  });
});

// Get all courses for admin (including drafts)
export const getAllCourses = asyncHandler(async (req, res) => {
  const { status, category_id, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT c.*, u.full_name as instructor_name, u.email as instructor_email,
           cat.name as category_name
    FROM courses c
    LEFT JOIN users u ON c.instructor_id = u.id
    LEFT JOIN categories cat ON c.category_id = cat.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  if (status) {
    paramCount++;
    query += ` AND c.status = $${paramCount}`;
    params.push(status);
  }

  if (category_id) {
    paramCount++;
    query += ` AND c.category_id = $${paramCount}`;
    params.push(category_id);
  }

  if (search) {
    paramCount++;
    query += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
    params.push(`%${search}%`);
  }

  query += ' ORDER BY c.created_at DESC';
  
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(limit);
  
  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const result = await pool.query(query, params);

  res.json({ courses: result.rows });
});

// Approve/Reject course
export const approveCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'published' or 'archived'

  if (!['published', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Use "published" or "archived"' });
  }

  const result = await pool.query(
    'UPDATE courses SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Course not found' });
  }

  res.json({
    message: `Course ${status} successfully`,
    course: result.rows[0]
  });
});

// Update course (admin can update any course)
export const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category_id, level, status, thumbnail_url } = req.body;

  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (title !== undefined) {
    fields.push(`title = $${paramIndex}`);
    values.push(title);
    paramIndex++;
  }
  if (description !== undefined) {
    fields.push(`description = $${paramIndex}`);
    values.push(description);
    paramIndex++;
  }
  if (price !== undefined) {
    fields.push(`price = $${paramIndex}`);
    values.push(price);
    paramIndex++;
  }
  if (category_id !== undefined) {
    fields.push(`category_id = $${paramIndex}`);
    values.push(category_id);
    paramIndex++;
  }
  if (level !== undefined) {
    fields.push(`level = $${paramIndex}`);
    values.push(level);
    paramIndex++;
  }
  if (status !== undefined) {
    fields.push(`status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }
  if (thumbnail_url !== undefined) {
    fields.push(`thumbnail_url = $${paramIndex}`);
    values.push(thumbnail_url);
    paramIndex++;
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE courses 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Course not found' });
  }

  res.json({
    message: 'Course updated successfully',
    course: result.rows[0]
  });
});

// Delete course (admin can delete any course)
export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if course exists
  const checkResult = await pool.query(
    'SELECT id, title FROM courses WHERE id = $1',
    [id]
  );

  if (checkResult.rows.length === 0) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // Delete related data first (cascade)
  await pool.query('DELETE FROM enrollments WHERE course_id = $1', [id]);
  await pool.query('DELETE FROM reviews WHERE course_id = $1', [id]);
  await pool.query('DELETE FROM wishlists WHERE course_id = $1', [id]);
  
  // Delete lessons and their related data
  await pool.query(`
    DELETE FROM lesson_progress 
    WHERE lesson_id IN (
      SELECT l.id FROM lessons l
      JOIN sections s ON l.section_id = s.id
      WHERE s.course_id = $1
    )
  `, [id]);
  
  await pool.query(`
    DELETE FROM lessons 
    WHERE section_id IN (
      SELECT id FROM sections WHERE course_id = $1
    )
  `, [id]);
  
  // Delete sections
  await pool.query('DELETE FROM sections WHERE course_id = $1', [id]);
  
  // Finally delete the course
  await pool.query('DELETE FROM courses WHERE id = $1', [id]);

  res.json({
    message: 'Course deleted successfully',
    deleted_course: checkResult.rows[0]
  });
});

// Get all categories
export const getCategories = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  res.json({ categories: result.rows });
});

// Create category
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;

  const result = await pool.query(
    'INSERT INTO categories (name, description, icon) VALUES ($1, $2, $3) RETURNING *',
    [name, description, icon]
  );

  res.status(201).json({
    message: 'Category created successfully',
    category: result.rows[0]
  });
});

// Update category
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, icon } = req.body;

  const result = await pool.query(
    `UPDATE categories 
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         icon = COALESCE($3, icon)
     WHERE id = $4
     RETURNING *`,
    [name, description, icon, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json({
    message: 'Category updated successfully',
    category: result.rows[0]
  });
});

// Delete category
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if any courses use this category
  const coursesCheck = await pool.query('SELECT COUNT(*) FROM courses WHERE category_id = $1', [id]);
  
  if (parseInt(coursesCheck.rows[0].count) > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete category with associated courses. Reassign courses first.' 
    });
  }

  const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json({ message: 'Category deleted successfully' });
});

// Get platform statistics
export const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalInstructors,
    totalStudents,
    verifiedInstructors,
    totalCourses,
    publishedCourses,
    draftCourses,
    totalEnrollments,
    totalRevenue,
    recentUsers,
    recentCourses
  ] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM users'),
    pool.query("SELECT COUNT(*) FROM users WHERE role = 'instructor'"),
    pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'"),
    pool.query("SELECT COUNT(*) FROM users WHERE role = 'instructor' AND is_verified = true"),
    pool.query('SELECT COUNT(*) FROM courses'),
    pool.query("SELECT COUNT(*) FROM courses WHERE status = 'published'"),
    pool.query("SELECT COUNT(*) FROM courses WHERE status = 'draft'"),
    pool.query('SELECT COUNT(*) FROM enrollments'),
    pool.query('SELECT COALESCE(SUM(c.price), 0) as total FROM enrollments e JOIN courses c ON e.course_id = c.id'),
    pool.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'),
    pool.query(`
      SELECT c.*, u.full_name as instructor_name 
      FROM courses c 
      LEFT JOIN users u ON c.instructor_id = u.id 
      ORDER BY c.created_at DESC 
      LIMIT 5
    `)
  ]);

  res.json({
    stats: {
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalInstructors: parseInt(totalInstructors.rows[0].count),
      totalStudents: parseInt(totalStudents.rows[0].count),
      verifiedInstructors: parseInt(verifiedInstructors.rows[0].count),
      totalCourses: parseInt(totalCourses.rows[0].count),
      publishedCourses: parseInt(publishedCourses.rows[0].count),
      draftCourses: parseInt(draftCourses.rows[0].count),
      totalEnrollments: parseInt(totalEnrollments.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].total)
    },
    recentUsers: recentUsers.rows,
    recentCourses: recentCourses.rows
  });
});

// Get all lessons with course and instructor info
export const getAllLessons = asyncHandler(async (req, res) => {
  const { course_id, content_type, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT l.*, 
           s.title as section_title,
           c.title as course_title,
           c.id as course_id,
           u.full_name as instructor_name,
           u.id as instructor_id
    FROM lessons l
    JOIN sections s ON l.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    JOIN users u ON c.instructor_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  if (course_id) {
    paramCount++;
    query += ` AND c.id = $${paramCount}`;
    params.push(course_id);
  }

  if (content_type) {
    paramCount++;
    query += ` AND l.content_type = $${paramCount}`;
    params.push(content_type);
  }

  if (search) {
    paramCount++;
    query += ` AND l.title ILIKE $${paramCount}`;
    params.push(`%${search}%`);
  }

  query += ' ORDER BY c.id, s.order_index, l.order_index';
  
  paramCount++;
  query += ` LIMIT $${paramCount}`;
  params.push(limit);
  
  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const result = await pool.query(query, params);

  // Get total count
  let countQuery = `
    SELECT COUNT(*) FROM lessons l
    JOIN sections s ON l.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    WHERE 1=1
  `;
  const countParams = [];
  let countParamNum = 0;

  if (course_id) {
    countParamNum++;
    countQuery += ` AND c.id = $${countParamNum}`;
    countParams.push(course_id);
  }

  if (content_type) {
    countParamNum++;
    countQuery += ` AND l.content_type = $${countParamNum}`;
    countParams.push(content_type);
  }

  if (search) {
    countParamNum++;
    countQuery += ` AND l.title ILIKE $${countParamNum}`;
    countParams.push(`%${search}%`);
  }

  const countResult = await pool.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);

  res.json({
    lessons: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Update lesson (admin can update any lesson)
export const updateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content_type, video_url, text_content, duration, order_index, is_preview } = req.body;

  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (title !== undefined) {
    fields.push(`title = $${paramIndex}`);
    values.push(title);
    paramIndex++;
  }
  if (content_type !== undefined) {
    fields.push(`content_type = $${paramIndex}`);
    values.push(content_type);
    paramIndex++;
  }
  if (video_url !== undefined) {
    fields.push(`video_url = $${paramIndex}`);
    values.push(video_url);
    paramIndex++;
  }
  if (text_content !== undefined) {
    fields.push(`text_content = $${paramIndex}`);
    values.push(text_content);
    paramIndex++;
  }
  if (duration !== undefined) {
    fields.push(`duration = $${paramIndex}`);
    values.push(duration);
    paramIndex++;
  }
  if (order_index !== undefined) {
    fields.push(`order_index = $${paramIndex}`);
    values.push(order_index);
    paramIndex++;
  }
  if (is_preview !== undefined) {
    fields.push(`is_preview = $${paramIndex}`);
    values.push(is_preview);
    paramIndex++;
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(id);
  const query = `
    UPDATE lessons 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  res.json({
    message: 'Lesson updated successfully',
    lesson: result.rows[0]
  });
});

// Delete lesson (admin can delete any lesson)
export const deleteLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // First check if lesson exists
  const checkResult = await pool.query(
    `SELECT l.id, l.title, c.title as course_title
     FROM lessons l
     JOIN sections s ON l.section_id = s.id
     JOIN courses c ON s.course_id = c.id
     WHERE l.id = $1`,
    [id]
  );

  if (checkResult.rows.length === 0) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  // Delete related data first
  await pool.query('DELETE FROM lesson_progress WHERE lesson_id = $1', [id]);
  await pool.query('DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id = $1)', [id]);
  await pool.query('DELETE FROM quiz_attempts WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id = $1)', [id]);
  await pool.query('DELETE FROM quizzes WHERE lesson_id = $1', [id]);
  await pool.query('DELETE FROM assignment_submissions WHERE assignment_id IN (SELECT id FROM assignments WHERE lesson_id = $1)', [id]);
  await pool.query('DELETE FROM assignments WHERE lesson_id = $1', [id]);
  
  // Delete the lesson
  await pool.query('DELETE FROM lessons WHERE id = $1', [id]);

  res.json({
    message: 'Lesson deleted successfully',
    deleted_lesson: checkResult.rows[0]
  });
});
