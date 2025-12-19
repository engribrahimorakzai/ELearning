import Quiz from '../models/Quiz.js';
import { Lesson } from '../models/Curriculum.js';
import Course from '../models/Course.js';
import { Section } from '../models/Curriculum.js';
import Enrollment from '../models/Enrollment.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import pool from '../config/database.js';

export const createQuiz = asyncHandler(async (req, res) => {
  const { title, passing_score, time_limit, questions } = req.body;
  const lesson_id = req.params.id;

  // Verify lesson exists and user owns the course
  const lesson = await Lesson.findById(lesson_id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  const section = await Section.findById(lesson.section_id);
  const course = await Course.findById(section.course_id);

  if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const quiz = await Quiz.create({
    lesson_id,
    title,
    passing_score,
    time_limit
  });

  // Add questions if provided
  if (questions && Array.isArray(questions)) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await Quiz.addQuestion({
        quiz_id: quiz.id,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        points: q.points || 1,
        order_index: i
      });
    }
  }

  const fullQuiz = await Quiz.findById(quiz.id);

  res.status(201).json({
    message: 'Quiz created successfully',
    quiz: fullQuiz
  });
});

export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  // Get student's previous attempts
  let previousAttempts = [];
  if (req.user.role === 'student') {
    const lesson = await Lesson.findById(quiz.lesson_id);
    const section = await Section.findById(lesson.section_id);
    const enrollment = await Enrollment.findByStudentAndCourse(req.user.id, section.course_id);
    
    if (enrollment) {
      const attemptsResult = await pool.query(
        `SELECT id, score, percentage, passed, completed_at
         FROM quiz_attempts
         WHERE quiz_id = $1 AND enrollment_id = $2
         ORDER BY completed_at DESC`,
        [req.params.id, enrollment.id]
      );
      previousAttempts = attemptsResult.rows;
    }
  }

  // Hide correct answers from students
  if (req.user.role === 'student' && quiz.questions) {
    quiz.questions = quiz.questions.map(({ correct_answer, ...rest }) => rest);
  }

  res.json({ 
    quiz,
    previous_attempts: previousAttempts
  });
});

export const startQuizAttempt = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  // Verify enrollment
  const lesson = await Lesson.findById(quiz.lesson_id);
  const section = await Section.findById(lesson.section_id);
  const enrollment = await Enrollment.findByStudentAndCourse(req.user.id, section.course_id);

  if (!enrollment) {
    return res.status(403).json({ error: 'Not enrolled in this course' });
  }

  const attempt = await Quiz.startAttempt(enrollment.id, req.params.id);

  res.status(201).json({
    message: 'Quiz attempt started',
    attempt
  });
});

export const submitQuiz = asyncHandler(async (req, res) => {
  const { attempt_id, answers } = req.body;

  const result = await Quiz.submitAttempt(attempt_id, answers);

  // Mark quiz lesson as completed when quiz is passed
  if (result.passed) {
    try {
      const quiz = await Quiz.findById(result.quiz_id);
      await pool.query(
        `INSERT INTO lesson_progress (enrollment_id, lesson_id, completed, completed_at)
         VALUES ($1, $2, true, CURRENT_TIMESTAMP)
         ON CONFLICT (enrollment_id, lesson_id) 
         DO UPDATE SET completed = true, completed_at = CURRENT_TIMESTAMP`,
        [result.enrollment_id, quiz.lesson_id]
      );
      console.log(`Quiz lesson ${quiz.lesson_id} marked as completed for enrollment ${result.enrollment_id}`);
      
      // Update enrollment progress
      await Enrollment.updateProgress(result.enrollment_id);
      console.log(`Enrollment progress updated for enrollment ${result.enrollment_id}`);
    } catch (err) {
      console.log('Failed to mark quiz lesson as complete:', err.message);
    }
  }

  // Auto-generate certificate if quiz passed and course completed
  let certificateGenerated = false;
  let certificateData = null;

  if (result.passed) {
    try {
      const { autoGenerateCertificate } = await import('../utils/certificateGenerator.js');
      const certResult = await autoGenerateCertificate(result.enrollment_id);
      
      if (certResult.success) {
        certificateGenerated = true;
        certificateData = certResult.certificate_data;
      }
    } catch (error) {
      console.log('Certificate generation skipped or failed:', error.message);
    }
  }

  res.json({
    message: 'Quiz submitted successfully',
    result,
    certificate_generated: certificateGenerated,
    certificate: certificateData
  });
});

export const getQuizResults = asyncHandler(async (req, res) => {
  const results = await Quiz.getAttemptResults(req.params.id);

  if (!results) {
    return res.status(404).json({ error: 'Quiz attempt not found' });
  }

  // Only allow viewing own results or instructor/admin
  if (results.student_id !== req.user.id && req.user.role === 'student') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  res.json({ results });
});

// Get quiz history for student
export const getQuizHistory = asyncHandler(async (req, res) => {
  const student_id = req.user.id;
  const { course_id } = req.query;

  let query = `
    SELECT qa.*, q.title as quiz_title, l.title as lesson_title,
           c.title as course_title, c.id as course_id
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    JOIN lessons l ON q.lesson_id = l.id
    JOIN sections s ON l.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    JOIN enrollments e ON qa.enrollment_id = e.id
    WHERE e.student_id = $1 AND qa.completed_at IS NOT NULL
  `;
  
  const params = [student_id];

  if (course_id) {
    query += ' AND c.id = $2';
    params.push(course_id);
  }

  query += ' ORDER BY qa.started_at DESC';

  const result = await pool.query(query, params);

  res.json({ history: result.rows });
});
