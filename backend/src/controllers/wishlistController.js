import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Add to wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const { course_id } = req.body;
  const student_id = req.user.id;

  // Check if already in wishlist
  const existing = await pool.query(
    'SELECT * FROM wishlists WHERE student_id = $1 AND course_id = $2',
    [student_id, course_id]
  );

  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'Course already in wishlist' });
  }

  // Check if already enrolled
  const enrolled = await pool.query(
    'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
    [student_id, course_id]
  );

  if (enrolled.rows.length > 0) {
    return res.status(400).json({ error: 'You are already enrolled in this course' });
  }

  const result = await pool.query(
    'INSERT INTO wishlists (student_id, course_id) VALUES ($1, $2) RETURNING *',
    [student_id, course_id]
  );

  res.status(201).json({
    message: 'Course added to wishlist',
    wishlist: result.rows[0]
  });
});

// Remove from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student_id = req.user.id;

  const result = await pool.query(
    'DELETE FROM wishlists WHERE id = $1 AND student_id = $2 RETURNING id',
    [id, student_id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Wishlist item not found' });
  }

  res.json({ message: 'Course removed from wishlist' });
});

// Get wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const student_id = req.user.id;

  const result = await pool.query(
    `SELECT w.id as wishlist_id, w.added_at, c.*,
            u.full_name as instructor_name,
            cat.name as category_name
     FROM wishlists w
     JOIN courses c ON w.course_id = c.id
     LEFT JOIN users u ON c.instructor_id = u.id
     LEFT JOIN categories cat ON c.category_id = cat.id
     WHERE w.student_id = $1
     ORDER BY w.added_at DESC`,
    [student_id]
  );

  res.json({ wishlist: result.rows });
});
