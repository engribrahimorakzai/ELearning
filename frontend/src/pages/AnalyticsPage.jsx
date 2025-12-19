import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { statsAPI, dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, Clock } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const AnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'student') {
        const data = await dashboardAPI.getStudentDashboard();
        const enrollmentTrend = await statsAPI.getEnrollmentTrend(6);
        
        // Real enrollment trend from database
        setEnrollmentData(enrollmentTrend || []);

        // Real progress distribution from student's enrollments
        const enrollments = data.enrollments || [];
        const completed = enrollments.filter(e => e.progress === 100).length;
        const inProgress = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
        const notStarted = enrollments.filter(e => e.progress === 0).length;

        setProgressData([
          { name: 'Completed', value: completed },
          { name: 'In Progress', value: inProgress },
          { name: 'Not Started', value: notStarted }
        ]);

        setStats({
          totalEnrolled: enrollments.length,
          completed,
          inProgress,
          avgProgress: enrollments.reduce((sum, e) => sum + e.progress, 0) / (enrollments.length || 1)
        });
      } else if (user?.role === 'admin') {
        // Admin analytics with REAL DATA
        console.log('🔍 Fetching real admin analytics...');
        const response = await statsAPI.getAdminAnalytics();
        console.log('📊 Real admin analytics received:', response);
        
        setStats({
          totalCourses: response.totalCourses,
          totalStudents: response.totalStudents,
          totalInstructors: response.totalInstructors,
          totalRevenue: response.totalRevenue,
          totalEnrollments: response.enrollmentTrend.reduce((sum, item) => sum + parseInt(item.enrollments), 0)
        });
        
        // Real enrollment trend from database
        setEnrollmentData(response.enrollmentTrend || []);

        // Real progress distribution from database
        setProgressData(response.progressDistribution || []);
      } else {
        // Instructor analytics
        const platformData = await statsAPI.getPlatformStats();
        const enrollmentTrend = await statsAPI.getEnrollmentTrend(6);
        
        setStats({
          totalCourses: platformData.courses,
          totalStudents: platformData.students,
          totalInstructors: platformData.instructors,
          totalEnrollments: platformData.enrollments
        });
        
        // Real enrollment trend
        setEnrollmentData(enrollmentTrend || []);

        // Instructor progress distribution
        setProgressData([
          { name: 'Published Courses', value: platformData?.courses || 0 },
          { name: 'Total Students', value: platformData?.students || 0 },
          { name: 'Total Enrollments', value: platformData?.enrollments || 0 }
        ]);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            <p className="text-center text-muted-foreground">Loading analytics...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your learning progress and performance</p>
          </div>

          {/* Stats Grid */}
          {user?.role === 'student' ? (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Enrolled</p>
                      <h3 className="text-3xl font-bold mt-1">{stats?.totalEnrolled || 0}</h3>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <h3 className="text-3xl font-bold mt-1">{stats?.completed || 0}</h3>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <h3 className="text-3xl font-bold mt-1">{stats?.inProgress || 0}</h3>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Progress</p>
                      <h3 className="text-3xl font-bold mt-1">{Math.round(stats?.avgProgress || 0)}%</h3>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Courses</p>
                      <h3 className="text-3xl font-bold mt-1">{stats?.totalCourses || 0}</h3>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <h3 className="text-3xl font-bold mt-1">{stats?.totalStudents || 0}</h3>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Instructors</p>
                      <h3 className="text-3xl font-bold mt-1">{stats?.totalInstructors || 0}</h3>
                    </div>
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Enrollments</p>
                      <h3 className="text-3xl font-bold mt-1">{stats?.totalEnrollments || 0}</h3>
                    </div>
                    <TrendingUp className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Enrollment Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="enrollments" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Progress Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Course Progress Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};
