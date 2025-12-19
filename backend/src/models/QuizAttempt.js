import pool from '../config/database.js';

class QuizAttempt {
  static async create({ enrollment_id, quiz_id }) {
    const result = await pool.query(
      `INSERT INTO quiz_attempts (enrollment_id, quiz_id, started_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [enrollment_id, quiz_id]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT qa.*, q.title as quiz_title, q.passing_score, q.time_limit
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByEnrollmentAndQuiz(enrollmentId, quizId) {
    const result = await pool.query(
      `SELECT qa.*, q.title as quiz_title, q.passing_score, q.time_limit
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.enrollment_id = $1 AND qa.quiz_id = $2
       ORDER BY qa.started_at DESC`,
      [enrollmentId, quizId]
    );
    return result.rows;
  }

  static async complete(id, { score, total_points, correct_count, incorrect_count, answers }) {
    const percentage = (score / total_points) * 100;
    
    // Get passing score and enrollment_id
    const quizResult = await pool.query(
      `SELECT q.passing_score, qa.enrollment_id
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.id = $1`,
      [id]
    );
    
    const passingScore = quizResult.rows[0]?.passing_score || 70;
    const passed = percentage >= passingScore;
    const enrollmentId = quizResult.rows[0]?.enrollment_id;
    
    const result = await pool.query(
      `UPDATE quiz_attempts 
       SET score = $1,
           total_points = $2,
           percentage = $3,
           passed = $4,
           completed_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [score, total_points, percentage, passed, id]
    );
    
    const attempt = result.rows[0];
    
    // Add correct/incorrect counts to result
    attempt.correct_answers = correct_count || 0;
    attempt.incorrect_answers = incorrect_count || 0;
    attempt.enrollment_id = enrollmentId;
    
    return attempt;
  }

  static async getAttemptStats(enrollmentId, quizId) {
    const result = await pool.query(
      `SELECT 
         COUNT(*) as total_attempts,
         MAX(score) as best_score,
         AVG(score) as average_score,
         MAX(percentage) as best_percentage,
         COUNT(*) FILTER (WHERE passed = true) as passed_attempts
       FROM quiz_attempts
       WHERE enrollment_id = $1 AND quiz_id = $2 AND completed_at IS NOT NULL`,
      [enrollmentId, quizId]
    );
    return result.rows[0];
  }

  static async getLatestAttempt(enrollmentId, quizId) {
    const result = await pool.query(
      `SELECT qa.*, q.title as quiz_title, q.passing_score, q.time_limit
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.enrollment_id = $1 AND qa.quiz_id = $2
       ORDER BY qa.started_at DESC
       LIMIT 1`,
      [enrollmentId, quizId]
    );
    return result.rows[0];
  }
}

export default QuizAttempt;
