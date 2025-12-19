import pool from '../config/database.js';

class QuizQuestion {
  static async create({ quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, points, order_index }) {
    const result = await pool.query(
      `INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, points, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, points || 1, order_index]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM quiz_questions WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByQuizId(quizId, includeAnswers = false) {
    let query = 'SELECT id, quiz_id, question, option_a, option_b, option_c, option_d, points, order_index';
    if (includeAnswers) {
      query = 'SELECT *';
    }
    query += ' FROM quiz_questions WHERE quiz_id = $1 ORDER BY order_index';
    
    const result = await pool.query(query, [quizId]);
    return result.rows;
  }

  static async update(id, { question, option_a, option_b, option_c, option_d, correct_answer, points, order_index }) {
    const result = await pool.query(
      `UPDATE quiz_questions 
       SET question = COALESCE($1, question),
           option_a = COALESCE($2, option_a),
           option_b = COALESCE($3, option_b),
           option_c = COALESCE($4, option_c),
           option_d = COALESCE($5, option_d),
           correct_answer = COALESCE($6, correct_answer),
           points = COALESCE($7, points),
           order_index = COALESCE($8, order_index)
       WHERE id = $9
       RETURNING *`,
      [question, option_a, option_b, option_c, option_d, correct_answer, points, order_index, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM quiz_questions WHERE id = $1', [id]);
  }

  static async bulkCreate(quizId, questions) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const createdQuestions = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const result = await client.query(
          `INSERT INTO quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, points, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [quizId, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.points || 1, i]
        );
        createdQuestions.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return createdQuestions;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default QuizQuestion;
