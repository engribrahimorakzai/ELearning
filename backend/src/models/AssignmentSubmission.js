import pool from '../config/database.js';

class AssignmentSubmission {
  static async create({ assignment_id, student_id, content, file_url }) {
    const result = await pool.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, content, file_url, submitted_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET content = $3, file_url = $4, submitted_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [assignment_id, student_id, content, file_url]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT asub.*, a.title as assignment_title, a.max_score, a.due_date,
              u.full_name as student_name, u.email as student_email,
              g.full_name as grader_name
       FROM assignment_submissions asub
       JOIN assignments a ON asub.assignment_id = a.id
       JOIN users u ON asub.student_id = u.id
       LEFT JOIN users g ON asub.graded_by = g.id
       WHERE asub.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByAssignmentId(assignmentId) {
    const result = await pool.query(
      `SELECT asub.*, u.full_name as student_name, u.email as student_email,
              g.full_name as grader_name
       FROM assignment_submissions asub
       JOIN users u ON asub.student_id = u.id
       LEFT JOIN users g ON asub.graded_by = g.id
       WHERE asub.assignment_id = $1
       ORDER BY asub.submitted_at DESC`,
      [assignmentId]
    );
    return result.rows;
  }

  static async findByStudentAndAssignment(studentId, assignmentId) {
    const result = await pool.query(
      `SELECT asub.*, a.title as assignment_title, a.max_score, a.due_date,
              g.full_name as grader_name
       FROM assignment_submissions asub
       JOIN assignments a ON asub.assignment_id = a.id
       LEFT JOIN users g ON asub.graded_by = g.id
       WHERE asub.student_id = $1 AND asub.assignment_id = $2`,
      [studentId, assignmentId]
    );
    return result.rows[0];
  }

  static async grade(id, { grade, feedback, graded_by }) {
    const result = await pool.query(
      `UPDATE assignment_submissions 
       SET grade = $1,
           feedback = $2,
           graded_by = $3,
           graded_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [grade, feedback, graded_by, id]
    );
    return result.rows[0];
  }

  static async getSubmissionStats(assignmentId) {
    const result = await pool.query(
      `SELECT 
         COUNT(*) as total_submissions,
         COUNT(*) FILTER (WHERE grade IS NOT NULL) as graded_submissions,
         AVG(grade) as average_grade,
         MAX(grade) as highest_grade,
         MIN(grade) as lowest_grade
       FROM assignment_submissions
       WHERE assignment_id = $1`,
      [assignmentId]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM assignment_submissions WHERE id = $1', [id]);
  }
}

export default AssignmentSubmission;
