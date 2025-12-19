import pool from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Create discussion
export const createDiscussion = asyncHandler(async (req, res) => {
  const { course_id, title, content } = req.body;
  const user_id = req.user.id;

  // Check if user is enrolled or is instructor
  const enrollment = await pool.query(
    'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
    [user_id, course_id]
  );

  const course = await pool.query(
    'SELECT * FROM courses WHERE id = $1 AND instructor_id = $2',
    [course_id, user_id]
  );

  if (enrollment.rows.length === 0 && course.rows.length === 0) {
    return res.status(403).json({ error: 'You must be enrolled in this course to post discussions' });
  }

  const result = await pool.query(
    `INSERT INTO discussions (course_id, user_id, title, content)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [course_id, user_id, title, content]
  );

  const discussion = result.rows[0];

  // Get user info
  const userInfo = await pool.query(
    'SELECT full_name, avatar_url FROM users WHERE id = $1',
    [user_id]
  );

  res.status(201).json({
    message: 'Discussion created successfully',
    discussion: {
      ...discussion,
      user_name: userInfo.rows[0].full_name,
      user_avatar: userInfo.rows[0].avatar_url,
      replies_count: 0
    }
  });
});

// Get course discussions
export const getDiscussions = asyncHandler(async (req, res) => {
  const { course_id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT d.*, u.full_name as user_name, u.avatar_url as user_avatar,
            (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = d.id) as replies_count
     FROM discussions d
     JOIN users u ON d.user_id = u.id
     WHERE d.course_id = $1
     ORDER BY d.created_at DESC
     LIMIT $2 OFFSET $3`,
    [course_id, limit, offset]
  );

  res.json({ discussions: result.rows });
});

// Get single discussion with replies
export const getDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const discussion = await pool.query(
    `SELECT d.*, u.full_name as user_name, u.avatar_url as user_avatar, u.role as user_role
     FROM discussions d
     JOIN users u ON d.user_id = u.id
     WHERE d.id = $1`,
    [id]
  );

  if (discussion.rows.length === 0) {
    return res.status(404).json({ error: 'Discussion not found' });
  }

  const replies = await pool.query(
    `SELECT dr.*, u.full_name as user_name, u.avatar_url as user_avatar, u.role as user_role
     FROM discussion_replies dr
     JOIN users u ON dr.user_id = u.id
     WHERE dr.discussion_id = $1
     ORDER BY dr.created_at ASC`,
    [id]
  );

  res.json({
    discussion: discussion.rows[0],
    replies: replies.rows
  });
});

// Reply to discussion
export const replyToDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;

  // Check if discussion exists and get course_id
  const discussion = await pool.query(
    'SELECT course_id FROM discussions WHERE id = $1',
    [id]
  );

  if (discussion.rows.length === 0) {
    return res.status(404).json({ error: 'Discussion not found' });
  }

  const course_id = discussion.rows[0].course_id;

  // Check if user is enrolled or is instructor
  const enrollment = await pool.query(
    'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
    [user_id, course_id]
  );

  const course = await pool.query(
    'SELECT * FROM courses WHERE id = $1 AND instructor_id = $2',
    [course_id, user_id]
  );

  if (enrollment.rows.length === 0 && course.rows.length === 0) {
    return res.status(403).json({ error: 'You must be enrolled in this course to reply' });
  }

  const result = await pool.query(
    `INSERT INTO discussion_replies (discussion_id, user_id, content)
     VALUES ($1, $2, $3) RETURNING *`,
    [id, user_id, content]
  );

  const reply = result.rows[0];

  // Get user info
  const userInfo = await pool.query(
    'SELECT full_name, avatar_url, role FROM users WHERE id = $1',
    [user_id]
  );

  res.status(201).json({
    message: 'Reply added successfully',
    reply: {
      ...reply,
      user_name: userInfo.rows[0].full_name,
      user_avatar: userInfo.rows[0].avatar_url,
      user_role: userInfo.rows[0].role
    }
  });
});

// Delete discussion
export const deleteDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const user_role = req.user.role;

  // Allow deletion if user is owner or admin
  let query = 'DELETE FROM discussions WHERE id = $1';
  const params = [id];

  if (user_role !== 'admin') {
    query += ' AND user_id = $2';
    params.push(user_id);
  }

  query += ' RETURNING id';

  const result = await pool.query(query, params);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Discussion not found or unauthorized' });
  }

  res.json({ message: 'Discussion deleted successfully' });
});

// Delete reply
export const deleteReply = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const user_role = req.user.role;

  let query = 'DELETE FROM discussion_replies WHERE id = $1';
  const params = [id];

  if (user_role !== 'admin') {
    query += ' AND user_id = $2';
    params.push(user_id);
  }

  query += ' RETURNING id';

  const result = await pool.query(query, params);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Reply not found or unauthorized' });
  }

  res.json({ message: 'Reply deleted successfully' });
});
