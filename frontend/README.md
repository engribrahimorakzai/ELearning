# 🎓 E-Learning Platform - Frontend

> A modern, responsive, and feature-rich frontend for an online learning management system built with React, Vite, Tailwind CSS, and shadcn/ui components.

[![React](https://img.shields.io/badge/React-18.2-blue)]()
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Components](#-components)
- [Routing](#-routing)
- [API Integration](#-api-integration)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Beautiful UI**: Modern login/register pages with smooth animations
- **Role-Based Access**: Separate interfaces for Students, Instructors, and Admins
- **Password Strength**: Real-time password validation with visual indicators
- **Protected Routes**: Secure route guards based on authentication and roles
- **Token Management**: Automatic JWT token storage and refresh
- **Persistent Sessions**: Remember me functionality

### 🧑‍🎓 Student Features
- **📊 Dashboard**: Personalized dashboard with learning statistics
  - Enrolled courses count
  - Completed lessons tracker
  - Certificates earned
  - Recent activity feed
  - Progress charts (Recharts)
  
- **🔍 Course Discovery**: Advanced course browsing
  - Search by title/description
  - Filter by category, level, price
  - Sort by rating, price, newest
  - Grid/List view toggle
  - Pagination support
  
- **📚 My Learning**: Track enrolled courses
  - Progress bars for each course
  - Continue learning quick access
  - Course completion status
  - Certificates section
  
- **🎥 Course Player**: Interactive video player
  - YouTube/Vimeo embed support
  - Curriculum sidebar navigation
  - Lesson completion tracking
  - Next/Previous lesson navigation
  - Video progress tracking
  - Picture-in-picture support
  
- **📝 Assessments**: Quiz and assignment interfaces
  - Multiple-choice quiz interface
  - Timer for timed quizzes
  - Real-time score calculation
  - Quiz history and results
  - Assignment submission with file upload
  - Grade viewing
  
- **⭐ Reviews**: Course review system
  - 5-star rating interface
  - Write detailed reviews
  - Edit/delete own reviews
  - View all course reviews
  
- **🎓 Certificates**: Digital certificates
  - Auto-generated on completion
  - Download as PDF
  - Share on social media
  - Certificate showcase

### 🧑‍🏫 Instructor Features
- **📊 Instructor Dashboard**: Comprehensive analytics
  - Total students count
  - Revenue statistics
  - Course performance metrics
  - Enrollment trends (charts)
  - Recent activities
  
- **➕ Course Creation**: Full course management
  - Rich text editor for descriptions
  - Image upload for thumbnails
  - Pricing & discounting
  - Category selection
  - Course level setting
  - Draft/Publish toggle
  
- **📖 Curriculum Builder**: Visual course builder
  - Drag-and-drop section organization
  - Add/Edit/Delete sections
  - Add multiple lesson types (video, text, PDF)
  - Reorder lessons
  - Preview mode
  - Bulk operations
  
- **✅ Quiz Creator**: Create assessments
  - Multiple-choice questions
  - Add multiple questions
  - Set correct answers
  - Configure passing score
  - Set time limits
  
- **📄 Assignment Creator**: Create assignments
  - Assignment descriptions
  - File upload requirements
  - Due date setting
  - Total points configuration
  
- **📝 Grading Interface**: Grade student work
  - View all submissions
  - Download submitted files
  - Assign grades and feedback
  - Bulk grading options
  
- **📈 Analytics**: Detailed insights
  - Student enrollment charts
  - Revenue reports
  - Course ratings
  - Completion rates

### 🛡️ Admin Features
- **👥 User Management**: Manage all users
  - View all users (students, instructors, admins)
  - Edit user roles
  - Suspend/Delete users
  - Search and filter users
  - User activity logs
  
- **📂 Category Management**: Organize courses
  - Create/Edit/Delete categories
  - Category icons
  - Subcategories support
  
- **📚 Course Management**: Oversee all courses
  - Approve/Reject courses
  - Feature courses
  - Remove inappropriate content
  
- **📊 Platform Analytics**: System-wide statistics
  - Total users, courses, revenue
  - Growth charts
  - Popular courses
  - User engagement metrics

### 🎨 Design & UX
- **Modern UI**: Clean, professional design inspired by Coursera/Udemy
- **Responsive**: Mobile-first, works on all devices
- **Dark Mode Ready**: Prepared for dark theme
- **Animations**: Smooth transitions and hover effects
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback (react-hot-toast)
- **Accessibility**: ARIA labels and keyboard navigation

---

## 🛠️ Tech Stack

### Core Technologies
- **⚛️ React 18.2** - Modern React with hooks
- **⚡ Vite 5.0** - Lightning-fast build tool
- **🎨 Tailwind CSS 3.3** - Utility-first CSS framework
- **🧩 shadcn/ui** - High-quality, accessible component library
- **🔀 React Router v6** - Client-side routing

### UI & Styling
- **Lucide React** - Beautiful SVG icons
- **class-variance-authority** - Component variants
- **clsx & tailwind-merge** - Dynamic class management
- **Custom Animations** - Smooth transitions

### Data & State Management
- **Axios** - HTTP client for API calls
- **React Context API** - Global state management
  - AuthContext (user authentication)
  - SidebarContext (sidebar state)
- **React Hooks** - useState, useEffect, useContext, useNavigate

### Additional Libraries
- **📊 Recharts** - Beautiful charts and graphs
- **🎥 React Player** - Video player (YouTube, Vimeo)
- **🔔 React Hot Toast** - Elegant notifications
- **📝 React Hook Form** - Form validation (if needed)

---

## 📦 Installation

### Prerequisites

Before you begin, ensure you have:
- ✅ **Node.js** v18 or higher
- ✅ **npm** or **yarn**
- ✅ **Backend API** running on `http://localhost:5000`

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- react, react-dom
- react-router-dom
- axios
- tailwindcss
- shadcn/ui components
- lucide-react
- recharts
- react-player
- react-hot-toast

### Step 3: Configure Environment (Optional)

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=EduLearn
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5173` (Vite default port)

### Step 5: Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` folder.

---

## 🌐 Environment Setup

### API Configuration

The frontend connects to the backend API. Configure the base URL in [src/services/api.js](src/services/api.js):

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

For production, update this to your deployed backend URL:

```javascript
const API_BASE_URL = 'https://api.yourdomain.com/api';
```

### CORS Setup

Ensure your backend allows requests from the frontend origin. In backend `.env`:

```env
CORS_ORIGIN=http://localhost:5173
```

---

## 📁 Project Structure

```
frontend/
├── public/                          # Static assets
│   └── vite.svg                     # Favicon
│
├── src/
│   ├── main.jsx                     # Application entry point
│   ├── App.jsx                      # Root component with routing
│   ├── index.css                    # Global styles & Tailwind imports
│   │
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── button.jsx           # Button component
│   │   │   ├── card.jsx             # Card component
│   │   │   ├── input.jsx            # Input component
│   │   │   ├── badge.jsx            # Badge component
│   │   │   ├── progress.jsx         # Progress bar
│   │   │   ├── avatar.jsx           # Avatar component
│   │   │   ├── select.jsx           # Select dropdown
│   │   │   ├── dialog.jsx           # Modal dialog
│   │   │   ├── tabs.jsx             # Tabs component
│   │   │   └── ...                  # Other UI components
│   │   │
│   │   ├── Navbar.jsx               # Top navigation bar
│   │   ├── Sidebar.jsx              # Side navigation (dashboard)
│   │   ├── ProtectedRoute.jsx       # Route guard component
│   │   ├── CurriculumBuilder.jsx    # Course curriculum editor
│   │   ├── QuizCreator.jsx          # Quiz creation interface
│   │   ├── AssignmentCreator.jsx    # Assignment creation
│   │   ├── FileUploader.jsx         # File upload component
│   │   ├── ReviewForm.jsx           # Review submission form
│   │   ├── ReviewList.jsx           # Display reviews
│   │   ├── StarRating.jsx           # Star rating component
│   │   └── CertificateDisplay.jsx   # Certificate viewer
│   │
│   ├── pages/                       # Page components (25+ pages)
│   │   ├── HomePage.jsx             # Landing page
│   │   ├── LoginPage.jsx            # Login page
│   │   ├── RegisterPage.jsx         # Registration page
│   │   │
│   │   ├── StudentDashboard.jsx     # Student dashboard
│   │   ├── InstructorDashboard.jsx  # Instructor dashboard
│   │   ├── AdminDashboardPage.jsx   # Admin dashboard
│   │   │
│   │   ├── CourseBrowsePage.jsx     # Browse all courses
│   │   ├── CourseDetailPage.jsx     # Single course details
│   │   ├── CoursePlayerPage.jsx     # Watch course lessons
│   │   ├── MyLearningPage.jsx       # Enrolled courses
│   │   │
│   │   ├── CreateCoursePage.jsx     # Create new course
│   │   ├── EditCoursePage.jsx       # Edit existing course
│   │   ├── MyCoursesPage.jsx        # Instructor courses
│   │   │
│   │   ├── QuizPage.jsx             # Take quiz
│   │   ├── QuizHistoryPage.jsx      # Quiz attempts history
│   │   ├── AssignmentPage.jsx       # Submit assignment
│   │   ├── GradesPage.jsx           # View grades
│   │   │
│   │   ├── CertificatesPage.jsx     # View certificates
│   │   ├── AnalyticsPage.jsx        # Instructor analytics
│   │   ├── CategoryManagementPage.jsx # Admin categories
│   │   ├── UserManagementPage.jsx   # Admin user management
│   │   │
│   │   ├── ProfilePage.jsx          # User profile
│   │   ├── SettingsPage.jsx         # User settings
│   │   └── NotFoundPage.jsx         # 404 page
│   │
│   ├── context/                     # React Context
│   │   ├── AuthContext.jsx          # Authentication state
│   │   └── SidebarContext.jsx       # Sidebar collapse state
│   │
│   ├── services/
│   │   └── api.js                   # Axios API client & endpoints
│   │
│   └── lib/
│       └── utils.js                 # Utility functions (cn helper)
│
├── .gitignore
├── package.json                     # Dependencies & scripts
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
├── postcss.config.js                # PostCSS configuration
├── index.html                       # HTML entry point
└── README.md                        # This file
```

---

## 📜 Available Scripts

```bash
# Install all dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🧩 Key Components

### UI Components (shadcn/ui)

All UI components are located in [src/components/ui/](src/components/ui/) and built with Radix UI primitives:

| Component | Purpose | Usage |
|-----------|---------|-------|
| `Button` | Primary actions | `<Button variant="default">Click</Button>` |
| `Card` | Content containers | `<Card><CardHeader><CardTitle>` |
| `Input` | Form inputs | `<Input type="email" placeholder="Email" />` |
| `Badge` | Status indicators | `<Badge variant="success">Published</Badge>` |
| `Progress` | Progress bars | `<Progress value={75} />` |
| `Avatar` | User avatars | `<Avatar><AvatarImage src="..." /></Avatar>` |
| `Select` | Dropdowns | `<Select><SelectItem value="1">Option</SelectItem>` |
| `Dialog` | Modals | `<Dialog><DialogContent>...</DialogContent>` |
| `Tabs` | Tab navigation | `<Tabs><TabsList><TabsTrigger>` |

### Custom Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `Navbar` | Top navigation with auth | [components/Navbar.jsx](src/components/Navbar.jsx) |
| `Sidebar` | Dashboard side menu | [components/Sidebar.jsx](src/components/Sidebar.jsx) |
| `ProtectedRoute` | Route authentication | [components/ProtectedRoute.jsx](src/components/ProtectedRoute.jsx) |
| `CurriculumBuilder` | Course curriculum editor | [components/CurriculumBuilder.jsx](src/components/CurriculumBuilder.jsx) |
| `QuizCreator` | Create quizzes | [components/QuizCreator.jsx](src/components/QuizCreator.jsx) |
| `AssignmentCreator` | Create assignments | [components/AssignmentCreator.jsx](src/components/AssignmentCreator.jsx) |
| `FileUploader` | Upload files | [components/FileUploader.jsx](src/components/FileUploader.jsx) |
| `ReviewForm` | Submit reviews | [components/ReviewForm.jsx](src/components/ReviewForm.jsx) |
| `StarRating` | Rating display/input | [components/StarRating.jsx](src/components/StarRating.jsx) |

---

## 🛣️ Routing Structure

The application uses React Router v6 with the following routes:

### Public Routes
```
/                    # Home/Landing page
/login               # Login page
/register            # Registration page
/courses             # Browse courses
/courses/:id         # Course details
```

### Protected Routes (Authentication Required)

**Student Routes:**
```
/dashboard           # Student dashboard
/my-learning         # Enrolled courses
/course/:id/play     # Course player
/quiz/:id            # Take quiz
/quiz-history        # Quiz attempts
/assignment/:id      # Submit assignment
/grades              # View grades
/certificates        # View certificates
/profile             # User profile
/settings            # User settings
```

**Instructor Routes:**
```
/dashboard           # Instructor dashboard
/my-courses          # Instructor's courses
/create-course       # Create new course
/edit-course/:id     # Edit course
/analytics           # Course analytics
/instructor/earnings # Revenue reports
```

**Admin Routes:**
```
/admin/dashboard           # Admin dashboard
/admin/users               # User management
/admin/categories          # Category management
/analytics                 # Platform analytics
```

---

## 🔌 API Integration

### API Service

The [src/services/api.js](src/services/api.js) file contains all API calls:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### API Methods

**Authentication:**
```javascript
api.post('/auth/register', { email, password, name, role })
api.post('/auth/login', { email, password })
api.get('/auth/me')
```

**Courses:**
```javascript
api.get('/courses')
api.get('/courses/:id')
api.post('/courses', courseData)
api.put('/courses/:id', courseData)
api.delete('/courses/:id')
api.post('/courses/:id/enroll')
```

**Curriculum:**
```javascript
api.get('/curriculum/course/:courseId')
api.post('/curriculum/sections', sectionData)
api.post('/curriculum/lessons', lessonData)
api.post('/curriculum/lessons/:id/complete')
```

**Quizzes & Assignments:**
```javascript
api.get('/quizzes/course/:courseId')
api.post('/quizzes/:id/attempt', answers)
api.post('/assignments/:id/submit', formData)
```

---

## 🎨 Styling Guide

### Tailwind Configuration

The project uses a custom Tailwind theme defined in [tailwind.config.js](tailwind.config.js):

```javascript
theme: {
  extend: {
    colors: {
      primary: '#4F46E5',      // Indigo
      secondary: '#06B6D4',    // Cyan
      success: '#10B981',      // Green
      danger: '#EF4444',       // Red
      warning: '#F59E0B',      // Amber
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    }
  }
}
```

### Common Utility Classes

```css
/* Containers */
.container             /* Max-width centered container */
.max-w-7xl mx-auto    /* Large centered content */

/* Spacing */
.p-6                  /* Padding 1.5rem */
.gap-4                /* Gap 1rem */
.space-y-4            /* Vertical spacing */

/* Typography */
.text-2xl font-bold   /* Large heading */
.text-muted-foreground /* Gray text */

/* Colors */
.bg-primary           /* Primary background */
.text-primary         /* Primary text */

/* Borders & Shadows */
.rounded-lg           /* Rounded corners */
.shadow-lg            /* Large shadow */
.border               /* Border */

/* Responsive */
.md:grid-cols-3       /* 3 columns on medium+ screens */
.lg:w-64              /* Width on large screens */
```

---

## 🎯 Context API

### AuthContext

Manages user authentication state:

```javascript
const { user, login, logout, isInstructor, isAdmin } = useAuth();

// Usage
if (user) {
  console.log(user.name, user.role);
}

if (isInstructor) {
  // Show instructor features
}
```

### SidebarContext

Manages sidebar collapse state:

```javascript
const { isCollapsed, setIsCollapsed } = useSidebar();

// Toggle sidebar
setIsCollapsed(!isCollapsed);
```

---

## 🔐 Authentication Flow

1. **Registration**: User signs up with email, password, and role
2. **Login**: User logs in, receives JWT token
3. **Token Storage**: Token saved in localStorage
4. **Auto-login**: Token checked on app load
5. **Protected Routes**: Routes check for valid token
6. **Token Refresh**: Automatic token validation
7. **Logout**: Clear token and redirect to login

---

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

### Mobile Navigation
- Hamburger menu for mobile
- Collapsible sidebar
- Touch-friendly buttons
- Responsive tables

---

## 🚀 Performance Optimization

### Implemented Optimizations

1. **Code Splitting**: React.lazy() for route-based splitting
2. **Image Optimization**: Lazy loading images
3. **Memoization**: useMemo and useCallback for expensive operations
4. **Debouncing**: Search inputs debounced
5. **Pagination**: Large lists paginated
6. **Caching**: API responses cached when appropriate

---

## 🧪 Testing

### Recommended Testing Approach

```bash
# Install testing libraries
npm install -D @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

### Test User Credentials

For development/testing:

**Student:**
```
Email: student@example.com
Password: student123
```

**Instructor:**
```
Email: instructor@example.com  
Password: instructor123
```

**Admin:**
```
Email: admin@example.com
Password: admin123
```

---

## 🐛 Troubleshooting

### Common Issues

**API Connection Error**
```javascript
// Check API_BASE_URL in src/services/api.js
// Ensure backend is running on correct port
```

**CORS Error**
```bash
# Backend .env should have:
CORS_ORIGIN=http://localhost:5173
```

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

**Styling Issues**
```bash
# Rebuild Tailwind
npm run build
```

---

## 📚 Resources

### Official Documentation
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [React Router](https://reactrouter.com)

### Learning Resources
- [React Tutorial](https://react.dev/learn)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs)
- [JavaScript ES6+](https://javascript.info)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use functional components with hooks
- Follow ES6+ syntax
- Use Tailwind for styling (avoid inline styles)
- Keep components small and focused
- Add PropTypes or TypeScript types

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built with ❤️ for modern education

---

## 📞 Support

- 📧 Email: support@elearning.com
- 💬 GitHub Issues: [Report an issue](https://github.com/yourusername/elearning/issues)
- 📖 Documentation: [View full docs](./docs)

---

**Happy Learning! 🎓**
│   │   ├── InstructorDashboard.jsx
│   │   ├── CreateCoursePage.jsx
│   │   ├── MyCoursesPage.jsx
│   │   └── ProfilePage.jsx
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state
│   ├── services/
│   │   └── api.js           # All API endpoints
│   ├── lib/
│   │   └── utils.js         # Utility functions
│   ├── App.jsx              # Main router
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

## 🔌 API Integration

All backend APIs are fully integrated in `src/services/api.js`:

### Authentication
- `authAPI.register()` - User registration
- `authAPI.login()` - User login
- `authAPI.getProfile()` - Get user profile
- `authAPI.updateProfile()` - Update profile

### Courses
- `courseAPI.browse()` - Browse courses with filters
- `courseAPI.getById()` - Get course details
- `courseAPI.create()` - Create course (instructor)
- `courseAPI.enroll()` - Enroll in course
- `courseAPI.getCurriculum()` - Get course curriculum
- `courseAPI.getMyCourses()` - Get enrolled courses

### Lessons & Content
- `lessonAPI.getById()` - Get lesson details
- `lessonAPI.markComplete()` - Mark lesson complete
- `quizAPI.startAttempt()` - Start quiz
- `quizAPI.submit()` - Submit quiz answers
- `assignmentAPI.submit()` - Submit assignment

### Reviews
- `reviewAPI.create()` - Write review
- `reviewAPI.voteHelpful()` - Vote review helpful

### Dashboard
- `dashboardAPI.student()` - Student dashboard data
- `dashboardAPI.instructor()` - Instructor dashboard data

### File Upload
- `uploadAPI.single()` - Upload single file
- `uploadAPI.multiple()` - Upload multiple files

## 🎯 Usage Examples

### Login
```javascript
import { authAPI } from './services/api';

const handleLogin = async () => {
  const response = await authAPI.login({
    email: 'student@test.com',
    password: 'password123'
  });
  localStorage.setItem('token', response.token);
};
```

### Browse Courses
```javascript
import { courseAPI } from './services/api';

const courses = await courseAPI.browse({
  search: 'javascript',
  min_rating: 4,
  sort: 'popularity'
});
```

### Enroll in Course
```javascript
await courseAPI.enroll(courseId);
```

## 🎨 Design Principles

1. **Clean & Minimal**: Airy spacing, clear hierarchy
2. **Educational Focus**: Soft colors, readable typography
3. **Consistent**: Same components across all pages
4. **Responsive**: Works on mobile, tablet, desktop
5. **Professional**: Looks like a real SaaS product

## 🌈 Color Palette

```css
Primary: hsl(221.2 83.2% 53.3%)     /* Indigo Blue */
Background: hsl(210 40% 98%)         /* Light Gray */
Card: hsl(0 0% 100%)                 /* White */
Muted: hsl(215.4 16.3% 46.9%)       /* Gray */
Success: Green                       /* Completed */
Warning: Amber                       /* Pending */
```

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Authentication Flow

1. User visits login page
2. Submits credentials
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. Token automatically attached to all API requests
6. Protected routes check for valid token
7. Role-based access control enforces permissions

## 🚀 Deployment

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel/Netlify
```bash
# Connect your repository
# Set build command: npm run build
# Set output directory: dist
```

## 📝 Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

**API Connection Issues:**
- Ensure backend is running on port 5000
- Check CORS configuration in backend
- Verify API_BASE_URL in `services/api.js`

**Build Errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## 📄 License

MIT

## 👥 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for modern education**
