import pool from '../config/database.js';
import Enrollment from '../models/Enrollment.js';

/**
 * Generate certificate URL for completed course
 * In a real application, this would generate a PDF certificate
 * For now, we create a unique certificate identifier
 */
export async function generateCertificate(enrollmentId) {
  try {
    // Get enrollment details
    const result = await pool.query(
      `SELECT 
        e.id as enrollment_id,
        e.course_id,
        e.student_id,
        u.full_name as student_name,
        c.title as course_title,
        c.instructor_id,
        i.full_name as instructor_name,
        e.enrolled_at
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      JOIN users i ON c.instructor_id = i.id
      WHERE e.id = $1`,
      [enrollmentId]
    );

    if (result.rows.length === 0) {
      throw new Error('Enrollment not found');
    }

    const enrollment = result.rows[0];
    
    // Calculate average quiz score for this enrollment
    const scoreResult = await pool.query(
      `SELECT 
        ROUND(AVG(qa.percentage), 2) as average_score,
        COUNT(qa.id) as total_quizzes_taken
      FROM quiz_attempts qa
      WHERE qa.enrollment_id = $1 AND qa.passed = true`,
      [enrollmentId]
    );
    
    const averageScore = scoreResult.rows[0]?.average_score || 0;
    const totalQuizzes = scoreResult.rows[0]?.total_quizzes_taken || 0;
    
    // Generate unique certificate ID
    const certificateId = `CERT-${enrollment.enrollment_id}-${Date.now()}`;
    const completedDate = new Date().toISOString().split('T')[0];
    
    // Create certificate URL (in real app, this would be a PDF URL)
    const certificateUrl = `/certificates/${certificateId}.pdf`;
    
    // Store certificate data
    const certificateData = {
      certificate_id: certificateId,
      student_name: enrollment.student_name,
      course_title: enrollment.course_title,
      instructor_name: enrollment.instructor_name,
      completion_date: completedDate,
      enrollment_date: enrollment.enrolled_at,
      certificate_url: certificateUrl,
      final_score: averageScore,
      total_quizzes: totalQuizzes
    };

    // Mark enrollment as complete with certificate
    await Enrollment.markComplete(enrollmentId, certificateUrl);

    console.log(`Certificate generated for enrollment ${enrollmentId}: ${certificateId}`);

    return {
      success: true,
      certificate_id: certificateId,
      certificate_url: certificateUrl,
      certificate_data: certificateData,
      message: 'Certificate generated successfully!'
    };
  } catch (error) {
    console.error('Certificate generation error:', error);
    throw error;
  }
}

/**
 * Check if student has completed all requirements for certificate
 */
export async function checkCourseCompletion(enrollmentId) {
  try {
    const result = await pool.query(
      `SELECT 
        e.id as enrollment_id,
        e.course_id,
        e.certificate_url,
        COUNT(l.id) as total_lessons,
        COUNT(lp.id) FILTER (WHERE lp.completed = true) as completed_lessons,
        COUNT(q.id) as total_quizzes,
        COUNT(qa.id) FILTER (WHERE qa.passed = true) as passed_quizzes
      FROM enrollments e
      JOIN sections s ON e.course_id = s.course_id
      JOIN lessons l ON s.id = l.section_id
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.enrollment_id = e.id
      LEFT JOIN quizzes q ON l.id = q.lesson_id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.enrollment_id = e.id
      WHERE e.id = $1
      GROUP BY e.id, e.course_id, e.certificate_url`,
      [enrollmentId]
    );

    if (result.rows.length === 0) {
      return {
        completed: false,
        reason: 'Enrollment not found'
      };
    }

    const completion = result.rows[0];
    
    // Check if all lessons completed
    const allLessonsCompleted = completion.completed_lessons === completion.total_lessons;
    
    // Check if all quizzes passed
    const allQuizzesPassed = completion.total_quizzes > 0 && 
                              completion.passed_quizzes === completion.total_quizzes;
    
    const isCompleted = allLessonsCompleted && allQuizzesPassed;

    return {
      completed: isCompleted,
      total_lessons: completion.total_lessons,
      completed_lessons: completion.completed_lessons,
      total_quizzes: completion.total_quizzes,
      passed_quizzes: completion.passed_quizzes,
      has_certificate: !!completion.certificate_url,
      certificate_url: completion.certificate_url,
      ready_for_certificate: isCompleted && !completion.certificate_url
    };
  } catch (error) {
    console.error('Course completion check error:', error);
    throw error;
  }
}

/**
 * Auto-generate certificate after quiz completion
 */
export async function autoGenerateCertificate(enrollmentId) {
  try {
    const completion = await checkCourseCompletion(enrollmentId);
    
    console.log('Certificate check for enrollment', enrollmentId, ':', {
      completed_lessons: `${completion.completed_lessons}/${completion.total_lessons}`,
      passed_quizzes: `${completion.passed_quizzes}/${completion.total_quizzes}`,
      ready: completion.ready_for_certificate
    });
    
    if (completion.ready_for_certificate) {
      return await generateCertificate(enrollmentId);
    }
    
    return {
      success: false,
      message: 'Course requirements not yet completed',
      completion
    };
  } catch (error) {
    console.error('Auto certificate generation error:', error);
    throw error;
  }
}
