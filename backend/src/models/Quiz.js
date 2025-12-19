import pool from '../config/database.js';
import QuizQuestion from './QuizQuestion.js';
import QuizAttempt from './QuizAttempt.js';

class Quiz {
  static async create({ lesson_id, title, passing_score, time_limit }) {
    const result = await pool.query(
      `INSERT INTO quizzes (lesson_id, title, passing_score, time_limit)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [lesson_id, title, passing_score || 70, time_limit]
    );
    return result.rows[0];
  }

  static async findById(id, includeAnswers = false) {
    const result = await pool.query(
      'SELECT * FROM quizzes WHERE id = $1',
      [id]
    );
    
    const quiz = result.rows[0];
    if (quiz) {
      quiz.questions = await QuizQuestion.findByQuizId(id, includeAnswers);
    }
    
    return quiz;
  }

  static async findByLessonId(lesson_id) {
    const result = await pool.query(
      'SELECT * FROM quizzes WHERE lesson_id = $1',
      [lesson_id]
    );
    return result.rows[0];
  }

  static async update(id, { title, passing_score, time_limit }) {
    const result = await pool.query(
      `UPDATE quizzes 
       SET title = COALESCE($1, title),
           passing_score = COALESCE($2, passing_score),
           time_limit = COALESCE($3, time_limit)
       WHERE id = $4
       RETURNING *`,
      [title, passing_score, time_limit, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM quizzes WHERE id = $1', [id]);
  }

  static async addQuestion(quizId, questionData) {
    return await QuizQuestion.create({
      quiz_id: quizId,
      ...questionData
    });
  }

  static async startAttempt(enrollmentId, quizId) {
    return await QuizAttempt.create({
      enrollment_id: enrollmentId,
      quiz_id: quizId
    });
  }

  static async submitAttempt(attemptId, answers) {
    // Get quiz with questions including correct answers
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      throw new Error('Quiz attempt not found');
    }

    const quiz = await this.findById(attempt.quiz_id, true);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Calculate score and count correct answers
    let score = 0;
    let total_points = 0;
    let correct_count = 0;
    let incorrect_count = 0;
    const questions = quiz.questions || [];

    questions.forEach((q) => {
      total_points += q.points;
      if (answers[q.id] === q.correct_answer) {
        score += q.points;
        correct_count++;
      } else {
        incorrect_count++;
      }
    });

    // Update attempt with results
    const result = await QuizAttempt.complete(attemptId, {
      score,
      total_points,
      correct_count,
      incorrect_count,
      answers
    });
    
    return result;
  }

  static async getAttemptResults(attemptId) {
    return await QuizAttempt.findById(attemptId);
  }

  static async getStudentAttempts(enrollmentId, quizId) {
    return await QuizAttempt.findByEnrollmentAndQuiz(enrollmentId, quizId);
  }

  static async getAttemptStats(enrollmentId, quizId) {
    return await QuizAttempt.getAttemptStats(enrollmentId, quizId);
  }
}

export default Quiz;
