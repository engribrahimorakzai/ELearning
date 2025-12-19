import pool from '../config/database.js';
import AssignmentSubmission from './AssignmentSubmission.js';

class Assignment {
  static async create({ lesson_id, title, description, max_score, due_date }) {
    const result = await pool.query(
      `INSERT INTO assignments (lesson_id, title, description, max_score, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [lesson_id, title, description, max_score || 100, due_date]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM assignments WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByLessonId(lesson_id) {
    const result = await pool.query(
      'SELECT * FROM assignments WHERE lesson_id = $1',
      [lesson_id]
    );
    return result.rows[0];
  }

  static async update(id, { title, description, max_score, due_date }) {
    const result = await pool.query(
      `UPDATE assignments 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           max_score = COALESCE($3, max_score),
           due_date = COALESCE($4, due_date)
       WHERE id = $5
       RETURNING *`,
      [title, description, max_score, due_date, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM assignments WHERE id = $1', [id]);
  }

  static async submitAssignment({ assignment_id, student_id, content, file_url }) {
    return await AssignmentSubmission.create({
      assignment_id,
      student_id,
      content,
      file_url
    });
  }

  static async gradeSubmission(submission_id, { grade, feedback, graded_by }) {
    return await AssignmentSubmission.grade(submission_id, {
      grade,
      feedback,
      graded_by
    });
  }

  static async getSubmission(assignment_id, student_id) {
    return await AssignmentSubmission.findByStudentAndAssignment(student_id, assignment_id);
  }

  static async getSubmissionById(submission_id) {
    return await AssignmentSubmission.findById(submission_id);
  }

  static async getAssignmentSubmissions(assignment_id) {
    return await AssignmentSubmission.findByAssignmentId(assignment_id);
  }

  static async getSubmissionStats(assignment_id) {
    return await AssignmentSubmission.getSubmissionStats(assignment_id);
  }
}

export default Assignment;
