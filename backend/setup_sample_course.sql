-- Sample Course Setup with 3 YouTube Videos
-- Run this in pgAdmin to create a complete course

-- Step 1: Get or create instructor user (modify email if needed)
DO $$
DECLARE
    v_instructor_id INTEGER;
    v_category_id INTEGER;
    v_course_id INTEGER;
    v_section_id INTEGER;
BEGIN
    -- Get first instructor user (or use your instructor email)
    SELECT id INTO v_instructor_id FROM users WHERE role = 'instructor' LIMIT 1;
    
    -- If no instructor exists, you need to create one first or change role
    IF v_instructor_id IS NULL THEN
        RAISE EXCEPTION 'No instructor user found. Please create an instructor account first.';
    END IF;
    
    -- Get Web Development category (or create if doesn't exist)
    SELECT id INTO v_category_id FROM categories WHERE name = 'Web Development' LIMIT 1;
    
    IF v_category_id IS NULL THEN
        INSERT INTO categories (name, description) 
        VALUES ('Web Development', 'Web technologies and frameworks')
        RETURNING id INTO v_category_id;
    END IF;
    
    -- Step 2: Create the course
    INSERT INTO courses (
        instructor_id,
        title,
        slug,
        description,
        category_id,
        level,
        price,
        thumbnail,
        status,
        total_lessons,
        created_at,
        updated_at
    ) VALUES (
        v_instructor_id,
        'Complete YouTube Tutorial Course',
        'complete-youtube-tutorial-course',
        'Learn through carefully selected YouTube tutorials. Complete all videos and pass the quiz to earn your certificate!',
        v_category_id,
        'beginner',
        0, -- Free course
        'https://via.placeholder.com/1280x720/4F46E5/ffffff?text=YouTube+Course',
        'published',
        4, -- 3 videos + 1 quiz
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_course_id;
    
    -- Step 3: Create section
    INSERT INTO sections (
        course_id,
        title,
        description,
        order_index,
        created_at
    ) VALUES (
        v_course_id,
        'Main Lessons',
        'Complete all video lessons in order',
        1,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_section_id;
    
    -- Step 4: Add Video Lessons
    -- Lesson 1
    INSERT INTO lessons (
        section_id,
        title,
        content_type,
        video_url,
        duration,
        order_index,
        is_preview,
        created_at
    ) VALUES (
        v_section_id,
        'Video Lesson 1',
        'video',
        'https://www.youtube.com/watch?v=ezbJwaLmOeM',
        600, -- 10 minutes (adjust as needed)
        1,
        true, -- First video is preview
        CURRENT_TIMESTAMP
    );
    
    -- Lesson 2
    INSERT INTO lessons (
        section_id,
        title,
        content_type,
        video_url,
        duration,
        order_index,
        is_preview,
        created_at
    ) VALUES (
        v_section_id,
        'Video Lesson 2',
        'video',
        'https://www.youtube.com/watch?v=1SZle1skb84',
        900, -- 15 minutes (adjust as needed)
        2,
        false,
        CURRENT_TIMESTAMP
    );
    
    -- Lesson 3
    INSERT INTO lessons (
        section_id,
        title,
        content_type,
        video_url,
        duration,
        order_index,
        is_preview,
        created_at
    ) VALUES (
        v_section_id,
        'Video Lesson 3',
        'video',
        'https://www.youtube.com/shorts/cLMwToJ2rK0',
        60, -- 1 minute (shorts are typically short)
        3,
        false,
        CURRENT_TIMESTAMP
    );
    
    -- Step 5: Create Final Quiz Section
    INSERT INTO sections (
        course_id,
        title,
        description,
        order_index,
        created_at
    ) VALUES (
        v_course_id,
        'Final Assessment',
        'Complete this quiz to earn your certificate',
        2,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_section_id;
    
    -- Add Quiz Lesson
    DECLARE
        v_quiz_id INTEGER;
        v_lesson_id INTEGER;
    BEGIN
        -- Create quiz lesson
        INSERT INTO lessons (
            section_id,
            title,
            content_type,
            text_content,
            duration,
            order_index,
            is_preview,
            created_at
        ) VALUES (
            v_section_id,
            'Final Quiz',
            'quiz',
            'Test your knowledge from all the video lessons',
            300, -- 5 minutes
            1,
            false,
            CURRENT_TIMESTAMP
        ) RETURNING id INTO v_lesson_id;
        
        -- Create quiz
        INSERT INTO quizzes (
            lesson_id,
            title,
            passing_score,
            time_limit,
            created_at
        ) VALUES (
            v_lesson_id,
            'MERN Stack Knowledge Quiz',
            60, -- 60% passing score (3/5 correct)
            600, -- 10 minutes
            CURRENT_TIMESTAMP
        ) RETURNING id INTO v_quiz_id;
        
        -- Add Quiz Questions (5 Questions, 20 points each = 100 total)
        -- Question 1
        INSERT INTO quiz_questions (
            quiz_id,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            points,
            order_index
        ) VALUES (
            v_quiz_id,
            'What does MERN stand for?',
            'MongoDB, Express, React, Node',
            'MySQL, Express, React, Node',
            'MongoDB, Ember, Redux, Node',
            'MariaDB, Express, React, Next',
            'A',
            20,
            1
        );
        
        -- Question 2
        INSERT INTO quiz_questions (
            quiz_id,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            points,
            order_index
        ) VALUES (
            v_quiz_id,
            'Which MERN stack technology is used for building the frontend UI?',
            'Node.js',
            'Express.js',
            'React.js',
            'MongoDB',
            'C',
            20,
            2
        );
        
        -- Question 3
        INSERT INTO quiz_questions (
            quiz_id,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            points,
            order_index
        ) VALUES (
            v_quiz_id,
            'Which database is used in the MERN stack?',
            'PostgreSQL',
            'MySQL',
            'Firebase',
            'MongoDB',
            'D',
            20,
            3
        );
        
        -- Question 4
        INSERT INTO quiz_questions (
            quiz_id,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            points,
            order_index
        ) VALUES (
            v_quiz_id,
            'What is the role of Express.js in the MERN stack?',
            'It manages the database',
            'It is a frontend library',
            'It is a backend web framework',
            'It is used for styling',
            'C',
            20,
            4
        );
        
        -- Question 5
        INSERT INTO quiz_questions (
            quiz_id,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            points,
            order_index
        ) VALUES (
            v_quiz_id,
            'Which language is commonly used across the entire MERN stack?',
            'Python',
            'Java',
            'JavaScript',
            'PHP',
            'C',
            20,
            5
        );
        
        RAISE NOTICE 'Course created successfully with ID: %', v_course_id;
        RAISE NOTICE 'Total lessons: 3 videos + 1 MERN quiz (5 questions)';
        RAISE NOTICE 'Quiz is locked until all 3 videos are completed';
        RAISE NOTICE 'Certificate will be generated after passing the quiz';
        RAISE NOTICE 'Course is now published and ready to enroll!';
    END;
    
END $$;

-- Verify the course was created
SELECT 
    c.id as course_id,
    c.title as course_title,
    c.status,
    COUNT(DISTINCT s.id) as sections_count,
    COUNT(DISTINCT l.id) as lessons_count
FROM courses c
LEFT JOIN sections s ON c.id = s.course_id
LEFT JOIN lessons l ON s.id = l.section_id
WHERE c.title = 'Complete YouTube Tutorial Course'
GROUP BY c.id, c.title, c.status;

SELECT 'Course setup completed successfully! Check your My Courses page.' as message;
