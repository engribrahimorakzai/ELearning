import express from 'express';
import {
  getEnrollmentProgress,
  getCertificate,
  getStudentDashboard,
  getInstructorDashboard
} from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

router.get('/enrollments/:id/progress', authenticate, getEnrollmentProgress);
router.get('/enrollments/:id/certificate', authenticate, authorize('student'), getCertificate);
router.get('/dashboard/student', authenticate, authorize('student'), getStudentDashboard);
router.get('/dashboard/instructor', authenticate, authorize('instructor', 'admin'), getInstructorDashboard);
router.get('/certificates', authenticate, authorize('student'), async (req, res) => {
  const result = await pool.query(
    `SELECT 
      e.id as enrollment_id,
      e.id,
      e.certificate_url,
      e.completed_at,
      c.id as course_id,
      c.title as course_title,
      c.thumbnail,
      u.full_name as instructor_name,
      student.full_name as student_name,
      e.enrolled_at,
      e.progress
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    JOIN users u ON c.instructor_id = u.id
    JOIN users student ON e.student_id = student.id
    WHERE e.student_id = $1 AND e.completed_at IS NOT NULL
    ORDER BY e.completed_at DESC`,
    [req.user.id]
  );
  
  res.json({ certificates: result.rows });
});

export default router;
