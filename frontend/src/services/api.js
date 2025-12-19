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
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// 🔐 AUTH APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// 📚 COURSE APIs
export const courseAPI = {
  browse: (params) => api.get('/courses', { params }),
  getCategories: () => api.get('/courses/categories'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  createCourse: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  getCurriculum: (id) => api.get(`/courses/${id}/curriculum`),
  getMyCourses: () => api.get('/courses/my-courses'),
  getMyTeaching: () => api.get('/courses/my-teaching'),
  getInstructorCourses: () => api.get('/courses/my-teaching'),
  getReviews: (id, params) => api.get(`/courses/${id}/reviews`, { params }),
};

// 📑 SECTION APIs (Curriculum)
export const sectionAPI = {
  create: (courseId, data) => api.post(`/courses/${courseId}/sections`, data),
  createSection: (courseId, data) => api.post(`/courses/${courseId}/sections`, data),
  getSections: (courseId) => api.get(`/courses/${courseId}/sections`),
  update: (id, data) => api.put(`/sections/${id}`, data),
  updateSection: (id, data) => api.put(`/sections/${id}`, data),
  delete: (id) => api.delete(`/sections/${id}`),
  deleteSection: (id) => api.delete(`/sections/${id}`),
};

// 📝 LESSON APIs
export const lessonAPI = {
  create: (sectionId, data) => api.post(`/sections/${sectionId}/lessons`, data),
  getById: (id) => api.get(`/lessons/${id}`),
  update: (id, data) => api.put(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
  markComplete: (id) => api.post(`/lessons/${id}/complete`),
};

// 🧠 QUIZ APIs
export const quizAPI = {
  create: (lessonId, data) => api.post(`/lessons/${lessonId}/quiz`, data),
  getById: (id) => api.get(`/quizzes/${id}`),
  getQuiz: (id) => api.get(`/quizzes/${id}`),
  getQuestions: (id) => api.get(`/quizzes/${id}/questions`),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  startAttempt: (id) => api.post(`/quizzes/${id}/attempt`),
  submit: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  submitQuiz: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  getResults: (id) => api.get(`/quizzes/${id}/results`),
};

// 📋 ASSIGNMENT APIs
export const assignmentAPI = {
  create: (lessonId, data) => api.post(`/lessons/${lessonId}/assignment`, data),
  getById: (id) => api.get(`/assignments/${id}`),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  gradeSubmission: (submissionId, data) => api.put(`/submissions/${submissionId}/grade`, data),
};

// ⭐ REVIEW APIs
export const reviewAPI = {
  create: (courseId, data) => api.post(`/courses/${courseId}/reviews`, data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  voteHelpful: (id, isHelpful) => api.post(`/reviews/${id}/helpful`, { is_helpful: isHelpful }),
};

// 📊 DASHBOARD APIs
export const dashboardAPI = {
  student: () => api.get('/dashboard/student'),
  instructor: () => api.get('/dashboard/instructor'),
  getEnrollmentProgress: (enrollmentId) => api.get(`/enrollments/${enrollmentId}/progress`),
  getCertificate: (enrollmentId) => api.get(`/enrollments/${enrollmentId}/certificate`),
  getCertificates: () => api.get('/certificates'),
};

// 📤 FILE UPLOAD APIs
export const uploadAPI = {
  single: async (type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/upload/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  multiple: async (type, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post(`/upload/${type}/multiple`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// 📊 STATS APIs
export const statsAPI = {
  getAll: () => api.get('/stats'),
  getPlatform: () => api.get('/stats/platform'),
  getPlatformStats: () => api.get('/stats/platform'),
  getAdminStats: () => api.get('/admin/stats'),
  getAdminAnalytics: () => api.get('/stats/admin/analytics'),
  getEnrollmentTrend: (months = 6) => api.get('/stats/enrollment-trend', { params: { months } }),
};

// 👨‍💼 ADMIN APIs
export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  verifyInstructor: (id, isVerified) => api.put(`/admin/users/${id}/verify`, { is_verified: isVerified }),
  getAllCourses: (params) => api.get('/admin/courses', { params }),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  approveCourse: (id, status) => api.put(`/admin/courses/${id}/approve`, { status }),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getStats: () => api.get('/admin/stats'),
};

// ❤️ WISHLIST APIs
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (courseId) => api.post('/wishlist', { course_id: courseId }),
  removeFromWishlist: (id) => api.delete(`/wishlist/${id}`),
};

// 💬 FORUM APIs
export const forumAPI = {
  createDiscussion: (courseId, data) => api.post(`/forum/courses/${courseId}/discussions`, data),
  getDiscussions: (courseId, params) => api.get(`/forum/courses/${courseId}/discussions`, { params }),
  getDiscussion: (id) => api.get(`/forum/discussions/${id}`),
  replyToDiscussion: (id, content) => api.post(`/forum/discussions/${id}/replies`, { content }),
  deleteDiscussion: (id) => api.delete(`/forum/discussions/${id}`),
  deleteReply: (id) => api.delete(`/forum/replies/${id}`),
};

// 👨‍🏫 INSTRUCTOR APIs
export const instructorAPI = {
  getCourseAnalytics: (courseId) => api.get(`/instructor/courses/${courseId}/analytics`),
  getStudentProgress: (courseId) => api.get(`/instructor/courses/${courseId}/students`),
  getEarnings: (params) => api.get('/instructor/earnings', { params }),
  respondToReview: (reviewId, response) => api.post(`/instructor/reviews/${reviewId}/respond`, { response }),
};

// Enhanced APIs with new endpoints
export const quizAPI_enhanced = {
  ...quizAPI,
  getQuizHistory: (params) => api.get('/quiz-history', { params }),
};

export const assignmentAPI_enhanced = {
  ...assignmentAPI,
  getGrades: (params) => api.get('/assignment-grades', { params }),
  getLessonResources: (lessonId) => api.get(`/lessons/${lessonId}/resources`),
};

// Merge enhanced versions
Object.assign(quizAPI, quizAPI_enhanced);
Object.assign(assignmentAPI, assignmentAPI_enhanced);

export default api;
