# 🎓 E-Learning Platform - Backend API

> A comprehensive RESTful API for an online learning management system (LMS) that enables course creation, enrollment, video lessons, quizzes, assignments, and progress tracking.

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)]()
[![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13%2B-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Contributing](#-contributing)

---

## ✨ Features

### 👤 User Management
- **Multi-role Authentication**: Student, Instructor, Admin
- **JWT-based Authorization**: Secure token-based authentication
- **Password Encryption**: bcrypt hashing for password security
- **Profile Management**: Update user information and preferences

### 📚 Course Management
- **Course CRUD**: Create, read, update, delete courses
- **Rich Course Details**: Title, description, pricing, category, level
- **Image Upload**: Course thumbnails via Cloudinary
- **Course Status**: Draft, published, archived
- **Instructor Dashboard**: Manage all instructor courses

### 📖 Curriculum System
- **Sections & Lessons**: Organized course structure
- **Multiple Content Types**: Video, text, PDF, external links
- **Lesson Resources**: Downloadable materials
- **Drag-and-drop Support**: Reorder sections and lessons
- **Video Hosting**: YouTube/Vimeo embeds + direct uploads

### 📝 Assessments
- **Quizzes**: Multiple-choice questions with auto-grading
- **Assignments**: File submissions with manual grading
- **Quiz History**: Track all quiz attempts
- **Grade Management**: View assignment scores and feedback
- **Progress Tracking**: Real-time completion percentage

### 🎓 Enrollment & Progress
- **Course Enrollment**: Students can enroll in courses
- **Lesson Completion**: Mark lessons as completed
- **Progress Tracking**: Track course completion percentage
- **Certificates**: Auto-generate upon 100% completion
- **Learning Dashboard**: View all enrolled courses

### ⭐ Reviews & Ratings
- **5-Star Rating System**: Rate courses after enrollment
- **Written Reviews**: Leave detailed feedback
- **Average Ratings**: Calculate course ratings
- **Review Management**: Edit/delete reviews

### 🔍 Discovery & Search
- **Advanced Filtering**: By category, level, price, rating
- **Search Functionality**: Find courses by title/description
- **Sorting Options**: Price, rating, popularity, newest
- **Category Management**: Admin-managed categories

### 📊 Analytics & Reports
- **Instructor Analytics**: Revenue, enrollments, ratings
- **Student Dashboard**: Progress, grades, certificates
- **Admin Reports**: Platform-wide statistics
- **Earning Tracking**: Instructor revenue reports

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL 13+
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: express-validator
- **Rate Limiting**: express-rate-limit
- **Logging**: Morgan

---

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- ✅ **Node.js** v16 or higher
- ✅ **PostgreSQL** v13 or higher
- ✅ **npm** or **yarn**
- ✅ **Cloudinary Account** (for image/video uploads)

### Step 1: Clone the Repository

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create PostgreSQL Database

Open PostgreSQL and create a new database:

```sql
CREATE DATABASE elearning_db;
```

### Step 4: Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=elearning_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 5: Initialize Database

Run the database initialization script to create all tables:

```bash
npm run init-db
```

This will create all necessary tables:
- users
- categories
- courses
- enrollments
- sections
- lessons
- lesson_progress
- quizzes
- quiz_questions
- quiz_attempts
- assignments
- assignment_submissions
- reviews
- resources
- wishlists

### Step 6: Start Development Server

```bash
npm run dev
```

The API will be running at: `http://localhost:5000`

### Step 7: Test the API

Visit: `http://localhost:5000/health`

You should see:
```json
{
  "status": "OK",
  "timestamp": "2025-12-19T10:30:00.000Z"
}
```

---

## 🚀 Production Deployment

```bash
# Build and start
npm start
```

Make sure to:
1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Use environment variables for sensitive data
5. Set up SSL/TLS certificates

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `yourpassword` |
| `DB_NAME` | Database name | `elearning_db` |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123xyz` |

---

## 🗄️ Database Setup

### Schema Overview

The database consists of 15 tables with proper relationships:

```
users (id, email, password, role, ...)
  ├── courses (instructor_id → users.id)
  │     ├── enrollments (student_id → users.id, course_id → courses.id)
  │     ├── sections (course_id → courses.id)
  │     │     └── lessons (section_id → sections.id)
  │     │           └── lesson_progress (user_id, lesson_id)
  │     ├── quizzes (course_id → courses.id)
  │     │     ├── quiz_questions (quiz_id → quizzes.id)
  │     │     └── quiz_attempts (user_id, quiz_id)
  │     ├── assignments (course_id → courses.id)
  │     │     └── assignment_submissions (user_id, assignment_id)
  │     ├── reviews (user_id, course_id)
  │     └── resources (course_id → courses.id)
  └── wishlists (user_id → users.id, course_id → courses.id)

categories (id, name, description)
  └── courses (category_id → categories.id)
```

### Manual Database Setup

If you prefer manual setup, run these SQL files in order:

```bash
# 1. Create main schema
psql -U postgres -d elearning_db -f create_database_schema.sql

# 2. Add additional features
psql -U postgres -d elearning_db -f additional_schema.sql

# 3. Insert sample data (optional)
psql -U postgres -d elearning_db -f setup_sample_course.sql
```

### Database Migrations

For schema updates, use the cleanup script:

```bash
# Clean and recreate database
psql -U postgres -d elearning_db -f cleanup_and_recreate.sql
```

⚠️ **Warning**: This will delete all existing data!

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js                    # Application entry point
│   │
│   ├── config/
│   │   ├── database.js              # PostgreSQL connection pool
│   │   └── cloudinary.js            # Cloudinary configuration
│   │
│   ├── database/
│   │   └── init.js                  # Database initialization script
│   │
│   ├── models/                      # Database models (15 models)
│   │   ├── User.js                  # User model
│   │   ├── Course.js                # Course model
│   │   ├── Category.js              # Category model
│   │   ├── Enrollment.js            # Enrollment model
│   │   ├── Section.js               # Section model
│   │   ├── Lesson.js                # Lesson model
│   │   ├── LessonProgress.js        # Lesson progress tracking
│   │   ├── Quiz.js                  # Quiz model
│   │   ├── QuizQuestion.js          # Quiz questions
│   │   ├── QuizAttempt.js           # Quiz attempts
│   │   ├── Assignment.js            # Assignment model
│   │   ├── AssignmentSubmission.js  # Assignment submissions
│   │   ├── Review.js                # Course reviews
│   │   ├── Resource.js              # Course resources
│   │   └── Curriculum.js            # Curriculum utilities
│   │
│   ├── controllers/                 # Business logic (13 controllers)
│   │   ├── authController.js        # Authentication & registration
│   │   ├── courseController.js      # Course CRUD operations
│   │   ├── curriculumController.js  # Sections & lessons management
│   │   ├── quizController.js        # Quiz operations
│   │   ├── assignmentController.js  # Assignment operations
│   │   ├── reviewController.js      # Review operations
│   │   ├── dashboardController.js   # Dashboard data
│   │   ├── instructorController.js  # Instructor-specific features
│   │   ├── adminController.js       # Admin operations
│   │   ├── statsController.js       # Statistics & analytics
│   │   ├── forumController.js       # Discussion forums
│   │   ├── uploadController.js      # File upload handling
│   │   └── wishlistController.js    # Wishlist operations
│   │
│   ├── routes/                      # API routes (13 route files)
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── courseRoutes.js          # /api/courses/*
│   │   ├── curriculumRoutes.js      # /api/curriculum/*
│   │   ├── quizRoutes.js            # /api/quizzes/*
│   │   ├── assignmentRoutes.js      # /api/assignments/*
│   │   ├── reviewRoutes.js          # /api/reviews/*
│   │   ├── dashboardRoutes.js       # /api/dashboard/*
│   │   ├── instructorRoutes.js      # /api/instructor/*
│   │   ├── adminRoutes.js           # /api/admin/*
│   │   ├── statsRoutes.js           # /api/stats/*
│   │   ├── forumRoutes.js           # /api/forums/*
│   │   ├── uploadRoutes.js          # /api/upload/*
│   │   └── wishlistRoutes.js        # /api/wishlist/*
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication
│   │   ├── errorHandler.js          # Global error handling
│   │   ├── validation.js            # Input validation
│   │   └── upload.js                # Multer file upload
│   │
│   └── utils/
│       ├── helpers.js               # Helper functions
│       ├── jwt.js                   # JWT utilities
│       └── certificateGenerator.js  # Certificate generation
│
├── uploads/                         # Local file storage
│   ├── image/                       # Course images
│   ├── video/                       # Video files
│   ├── document/                    # PDF & documents
│   └── general/                     # Other files
│
├── *.sql                            # Database schema files
├── .env                             # Environment variables
├── package.json                     # Dependencies
└── README.md                        # This file
```

---

## 🔌 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints Summary (50+ endpoints)

#### 🔐 Authentication (`/api/auth`)
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
GET    /api/auth/me                # Get current user
PUT    /api/auth/profile           # Update profile
```

#### 📚 Courses (`/api/courses`)
```
GET    /api/courses                # Get all courses (with filters)
GET    /api/courses/:id            # Get course details
POST   /api/courses                # Create course (instructor)
PUT    /api/courses/:id            # Update course (instructor)
DELETE /api/courses/:id            # Delete course (instructor)
POST   /api/courses/:id/enroll     # Enroll in course (student)
GET    /api/courses/:id/check-enrollment  # Check if enrolled
```

#### 📖 Curriculum (`/api/curriculum`)
```
GET    /api/curriculum/course/:courseId    # Get course curriculum
POST   /api/curriculum/sections            # Create section
PUT    /api/curriculum/sections/:id        # Update section
DELETE /api/curriculum/sections/:id        # Delete section
POST   /api/curriculum/lessons             # Create lesson
PUT    /api/curriculum/lessons/:id         # Update lesson
DELETE /api/curriculum/lessons/:id         # Delete lesson
POST   /api/curriculum/lessons/:id/complete # Mark lesson complete
```

#### 📝 Quizzes (`/api/quizzes`)
```
GET    /api/quizzes/course/:courseId       # Get course quizzes
POST   /api/quizzes                        # Create quiz
GET    /api/quizzes/:id                    # Get quiz details
POST   /api/quizzes/:id/attempt            # Submit quiz attempt
GET    /api/quizzes/:id/attempts           # Get user attempts
```

#### 📄 Assignments (`/api/assignments`)
```
GET    /api/assignments/course/:courseId   # Get course assignments
POST   /api/assignments                    # Create assignment
GET    /api/assignments/:id                # Get assignment details
POST   /api/assignments/:id/submit         # Submit assignment
GET    /api/assignments/:id/submissions    # Get submissions (instructor)
PUT    /api/assignments/submissions/:id/grade  # Grade submission
```

#### ⭐ Reviews (`/api/reviews`)
```
GET    /api/reviews/course/:courseId       # Get course reviews
POST   /api/reviews                        # Create review
PUT    /api/reviews/:id                    # Update review
DELETE /api/reviews/:id                    # Delete review
```

#### 📊 Dashboard (`/api/dashboard`)
```
GET    /api/dashboard/student              # Student dashboard
GET    /api/dashboard/instructor           # Instructor dashboard
GET    /api/dashboard/admin                # Admin dashboard
```

#### 🎓 Instructor (`/api/instructor`)
```
GET    /api/instructor/courses             # Get instructor courses
GET    /api/instructor/analytics           # Get analytics
GET    /api/instructor/earnings            # Get earnings
GET    /api/instructor/students            # Get enrolled students
```

#### 🛡️ Admin (`/api/admin`)
```
GET    /api/admin/users                    # Get all users
PUT    /api/admin/users/:id/role           # Update user role
DELETE /api/admin/users/:id                # Delete user
GET    /api/admin/categories               # Manage categories
POST   /api/admin/categories               # Create category
```

#### 📤 File Upload (`/api/upload`)
```
POST   /api/upload/image                   # Upload image
POST   /api/upload/video                   # Upload video
POST   /api/upload/document                # Upload document
```

#### 💝 Wishlist (`/api/wishlist`)
```
GET    /api/wishlist                       # Get user wishlist
POST   /api/wishlist                       # Add to wishlist
DELETE /api/wishlist/:courseId             # Remove from wishlist
```

---

## 🔒 Security

### Implemented Security Measures

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Minimum password requirements

2. **JWT Authentication**
   - Secure token generation
   - Token expiration (7 days default)
   - Protected routes middleware

3. **Input Validation**
   - express-validator for all inputs
   - SQL injection prevention
   - XSS protection

4. **HTTP Security Headers**
   - Helmet.js integration
   - CORS configuration
   - Rate limiting on sensitive routes

5. **File Upload Security**
   - File type validation
   - File size limits
   - Secure storage with Cloudinary

6. **Role-Based Access Control**
   - Student, Instructor, Admin roles
   - Route-level authorization
   - Resource ownership validation

---

## 🧪 Testing

### Test User Accounts

After running `npm run init-db`, you can use these test accounts:

**Admin Account:**
```
Email: admin@example.com
Password: admin123
```

**Instructor Account:**
```
Email: instructor@example.com
Password: instructor123
```

**Student Account:**
```
Email: student@example.com
Password: student123
```

### API Testing Tools

Use these tools to test the API:
- **Postman** - Import API collection
- **Thunder Client** - VS Code extension
- **cURL** - Command-line testing
- **Browser** - For GET endpoints

### Example cURL Request

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"student123"}'

# Get courses
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer <your_token>"
```

---

## 📊 Database Models

### Core Models

| Model | Description | Key Fields |
|-------|-------------|------------|
| **User** | System users | id, email, password, role, name |
| **Course** | Courses | id, title, description, price, instructor_id |
| **Category** | Course categories | id, name, description |
| **Enrollment** | Course enrollments | id, student_id, course_id, progress |
| **Section** | Course sections | id, course_id, title, order |
| **Lesson** | Section lessons | id, section_id, title, content_type |
| **Quiz** | Quizzes | id, course_id, title, passing_score |
| **Assignment** | Assignments | id, course_id, title, due_date |
| **Review** | Course reviews | id, course_id, user_id, rating |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Available Scripts

```bash
# Install dependencies
npm install

# Start development server (with nodemon)
npm run dev

# Start production server
npm start

# Initialize database
npm run init-db
```

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Verify connection details in .env
DB_HOST=localhost
DB_PORT=5432
```

**Port Already in Use**
```bash
# Change PORT in .env
PORT=5001
```

**JWT Token Invalid**
```bash
# Clear browser localStorage
# Re-login to get new token
```

---

## 📞 Support

For issues and questions:
- 📧 Email: support@elearning.com
- 💬 GitHub Issues: [Create an issue](https://github.com/yourusername/elearning/issues)
- 📚 Documentation: [View docs](./docs)

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed with ❤️ for modern education

---

**Happy Coding! 🚀**

### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
GET    /api/auth/profile       # Get profile
PUT    /api/auth/profile       # Update profile
```

### Courses
```
GET    /api/courses                   # Browse courses
GET    /api/courses/:id               # Course details
POST   /api/courses                   # Create course
PUT    /api/courses/:id               # Update course
DELETE /api/courses/:id               # Delete course
POST   /api/courses/:id/enroll        # Enroll in course
GET    /api/courses/:id/curriculum    # Get curriculum
GET    /api/courses/my-courses        # Student's courses
GET    /api/courses/my-teaching       # Instructor's courses
```

### Curriculum
```
POST   /api/courses/:id/sections      # Add section
PUT    /api/sections/:id              # Update section
DELETE /api/sections/:id              # Delete section
POST   /api/sections/:id/lessons      # Add lesson
GET    /api/lessons/:id               # Get lesson
PUT    /api/lessons/:id               # Update lesson
DELETE /api/lessons/:id               # Delete lesson
POST   /api/lessons/:id/complete      # Mark complete
```

### Quizzes
```
POST   /api/lessons/:id/quiz          # Create quiz
GET    /api/quizzes/:id               # Get quiz
POST   /api/quizzes/:id/attempt       # Start attempt
POST   /api/quizzes/:id/submit        # Submit quiz
GET    /api/quizzes/:id/results       # Get results
```

### Assignments
```
POST   /api/lessons/:id/assignment    # Create assignment
GET    /api/assignments/:id           # Get assignment
POST   /api/assignments/:id/submit    # Submit assignment
PUT    /api/submissions/:id/grade     # Grade submission
```

### Reviews
```
POST   /api/courses/:id/reviews       # Write review
GET    /api/courses/:id/reviews       # Get reviews
PUT    /api/reviews/:id               # Update review
DELETE /api/reviews/:id               # Delete review
POST   /api/reviews/:id/helpful       # Mark helpful
```

### Dashboards
```
GET    /api/dashboard/student         # Student dashboard
GET    /api/dashboard/instructor      # Instructor dashboard
GET    /api/enrollments/:id/progress  # Progress tracking
GET    /api/enrollments/:id/certificate # Get certificate
```

## 🗄️ Database Schema

**14 Tables:**
- users, categories, courses, enrollments
- sections, lessons, resources
- quizzes, quiz_questions, quiz_attempts
- assignments, assignment_submissions
- lesson_progress, reviews

[View complete schema in database/init.js](src/database/init.js)

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet.js, CORS, Rate Limiting
- **Validation:** Express-validator
- **File Upload:** Multer
- **Password Hashing:** Bcrypt
- **Logging:** Morgan

## 👥 User Roles

### Student
- Browse and enroll in courses
- Complete lessons and track progress
- Take quizzes and submit assignments
- Write reviews

### Instructor
- Create and manage courses
- Build curriculum with sections/lessons
- Create quizzes and assignments
- Grade submissions
- View analytics

### Admin
- Full system access
- Manage all users and courses
- Access all dashboards

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation on all endpoints
- SQL injection prevention
- XSS protection (Helmet)
- CORS configuration
- Rate limiting (100 requests/15 min)

## 🧪 Testing

Run the complete test suite using the testing guide:

```bash
# See COMPLETE_TESTING_GUIDE.md for detailed instructions
```

## 📊 Performance

- Database indexes on frequently queried columns
- Efficient JOIN queries
- Pagination support
- Response time < 500ms for complex queries

## 📝 Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run init-db    # Initialize database schema
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- Built with Node.js and Express.js
- Database powered by PostgreSQL
- Authentication using JWT

## 📞 Support

For questions or issues:
- Check the [COMPLETE_TESTING_GUIDE.md](COMPLETE_TESTING_GUIDE.md)
- Review the [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- See [API_ENDPOINTS.md](API_ENDPOINTS.md) for API details

---

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Last Updated:** December 14, 2025
   ```bash
   npm run init-db
   ```

6. Start the server:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000`

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile

### Courses
- `GET /api/courses` - Browse courses with filters
- `GET /api/courses/:id` - Course details
- `POST /api/courses` - Create course (Instructor)
- `PUT /api/courses/:id` - Update course (Instructor)
- `DELETE /api/courses/:id` - Delete course (Instructor)
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/:id/curriculum` - Course structure
- `GET /api/courses/my-courses` - Student's enrolled courses
- `GET /api/courses/my-teaching` - Instructor's courses

### Sections & Lessons
- `POST /api/courses/:id/sections` - Add section
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section
- `POST /api/sections/:id/lessons` - Add lesson
- `GET /api/lessons/:id` - Lesson content
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson
- `POST /api/lessons/:id/complete` - Mark as complete

### Quizzes
- `POST /api/lessons/:id/quiz` - Create quiz
- `GET /api/quizzes/:id` - Get quiz
- `POST /api/quizzes/:id/attempt` - Start quiz attempt
- `POST /api/quizzes/:id/submit` - Submit quiz
- `GET /api/quizzes/:id/results` - Quiz results

### Assignments
- `POST /api/lessons/:id/assignment` - Create assignment
- `GET /api/assignments/:id` - Get assignment
- `POST /api/assignments/:id/submit` - Submit assignment
- `PUT /api/submissions/:id/grade` - Grade submission

### Reviews
- `POST /api/courses/:id/reviews` - Write review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `POST /api/reviews/:id/helpful` - Mark helpful

### Progress & Dashboard
- `GET /api/enrollments/:id/progress` - Course progress
- `GET /api/enrollments/:id/certificate` - Get certificate
- `GET /api/dashboard/student` - Student statistics
- `GET /api/dashboard/instructor` - Instructor statistics

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── database/       # Database connection and initialization
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
└── server.js       # Application entry point
```

## License

MIT
