import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Pages
import { StudentDashboard } from './pages/StudentDashboard';
import { CourseBrowsePage } from './pages/CourseBrowsePage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import { MyLearningPage } from './pages/MyLearningPage';
import { QuizPage } from './pages/QuizPage';
import { AssignmentPage } from './pages/AssignmentPage';

// Instructor Pages
import { InstructorDashboard } from './pages/InstructorDashboard';
import { CreateCoursePage } from './pages/CreateCoursePage';
import { MyCoursesPage } from './pages/MyCoursesPage';

// Shared Pages
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';
import { CertificatesPage } from './pages/CertificatesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { CategoryManagementPage } from './pages/CategoryManagementPage';

// New Student Pages
import { WishlistPage } from './pages/WishlistPage';
import { QuizHistoryPage } from './pages/QuizHistoryPage';
import { GradesPage } from './pages/GradesPage';

// New Instructor Pages
import { EarningsPage } from './pages/EarningsPage';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SidebarProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes - All Users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseBrowsePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:id"
            element={
              <ProtectedRoute>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <CertificatesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute requireRole={['instructor', 'admin']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Student Only Routes */}
          <Route
            path="/my-learning"
            element={
              <ProtectedRoute requireRole={['student']}>
                <MyLearningPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:id/learn"
            element={
              <ProtectedRoute requireRole={['student']}>
                <CoursePlayerPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz/:id"
            element={
              <ProtectedRoute requireRole={['student']}>
                <QuizPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignment/:id"
            element={
              <ProtectedRoute requireRole={['student']}>
                <AssignmentPage />
              </ProtectedRoute>
            }
          />

          {/* New Student Routes */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute requireRole={['student']}>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz-history"
            element={
              <ProtectedRoute requireRole={['student']}>
                <QuizHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/grades"
            element={
              <ProtectedRoute requireRole={['student']}>
                <GradesPage />
              </ProtectedRoute>
            }
          />

          {/* Instructor Only Routes */}
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute requireRole={['instructor', 'admin']}>
                <MyCoursesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-course"
            element={
              <ProtectedRoute requireRole={['instructor', 'admin']}>
                <CreateCoursePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/instructor/earnings"
            element={
              <ProtectedRoute requireRole={['instructor', 'admin']}>
                <EarningsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireRole={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireRole={['admin']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requireRole={['admin']}>
                <CategoryManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

// Dashboard Router - redirects based on role
function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <AdminDashboardPage />;
  }
  if (user?.role === 'student') {
    return <StudentDashboard />;
  }
  return <InstructorDashboard />;
}

export default App;
