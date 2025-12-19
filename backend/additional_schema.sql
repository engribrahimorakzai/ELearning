-- Additional tables for new features
-- Run this after the main schema

-- Wishlists Table
CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- Discussions Table
CREATE TABLE IF NOT EXISTS discussions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Discussion Replies Table
CREATE TABLE IF NOT EXISTS discussion_replies (
    id SERIAL PRIMARY KEY,
    discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Video Progress Tracking
CREATE TABLE IF NOT EXISTS video_progress (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    watched_time INTEGER DEFAULT 0, -- seconds
    duration INTEGER DEFAULT 0, -- seconds
    last_watched TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, lesson_id)
);

-- Course Bundles
CREATE TABLE IF NOT EXISTS bundles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percentage INTEGER DEFAULT 0,
    thumbnail VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bundle Courses
CREATE TABLE IF NOT EXISTS bundle_courses (
    id SERIAL PRIMARY KEY,
    bundle_id INTEGER NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(bundle_id, course_id)
);

-- Add instructor_response column to reviews if not exists
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS instructor_response TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS response_at TIMESTAMPTZ;

-- Create Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_wishlists_student ON wishlists(student_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_course ON wishlists(course_id);
CREATE INDEX IF NOT EXISTS idx_discussions_course ON discussions(course_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_enrollment ON video_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_lesson ON video_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_bundle_courses_bundle ON bundle_courses(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_courses_course ON bundle_courses(course_id);

SELECT 'Additional schema created successfully!' AS message;
