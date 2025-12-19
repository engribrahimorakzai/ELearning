-- CLEANUP AND RECREATE COURSE WITH QUIZ
-- Run this in pgAdmin to delete old course and create new one

-- Step 1: Delete old course data
DELETE FROM lesson_progress WHERE enrollment_id IN (
    SELECT e.id FROM enrollments e 
    JOIN courses c ON e.course_id = c.id 
    WHERE c.title = 'Complete YouTube Tutorial Course'
);

DELETE FROM quiz_attempts WHERE enrollment_id IN (
    SELECT e.id FROM enrollments e 
    JOIN courses c ON e.course_id = c.id 
    WHERE c.title = 'Complete YouTube Tutorial Course'
);

DELETE FROM enrollments WHERE course_id IN (
    SELECT id FROM courses WHERE title = 'Complete YouTube Tutorial Course'
);

DELETE FROM quiz_questions WHERE quiz_id IN (
    SELECT q.id FROM quizzes q
    JOIN lessons l ON q.lesson_id = l.id
    JOIN sections s ON l.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    WHERE c.title = 'Complete YouTube Tutorial Course'
);

DELETE FROM quizzes WHERE lesson_id IN (
    SELECT l.id FROM lessons l
    JOIN sections s ON l.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    WHERE c.title = 'Complete YouTube Tutorial Course'
);

DELETE FROM lessons WHERE section_id IN (
    SELECT s.id FROM sections s
    JOIN courses c ON s.course_id = c.id
    WHERE c.title = 'Complete YouTube Tutorial Course'
);

DELETE FROM sections WHERE course_id IN (
    SELECT id FROM courses WHERE title = 'Complete YouTube Tutorial Course'
);

DELETE FROM courses WHERE title = 'Complete YouTube Tutorial Course';

-- Step 2: Now run the setup_sample_course.sql file
-- In pgAdmin: File -> Open -> setup_sample_course.sql -> Execute

SELECT 'Old course deleted successfully! Now run setup_sample_course.sql' as message;
