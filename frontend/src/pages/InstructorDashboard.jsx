import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { courseAPI, statsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Star, DollarSign, TrendingUp, Eye, Plus } from 'lucide-react';

export const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load instructor courses
      const coursesData = await courseAPI.getInstructorCourses();
      console.log('Instructor courses:', coursesData);
      setCourses(coursesData.courses || []);

      // Calculate stats from courses
      const totalEnrollments = coursesData.courses?.reduce((sum, c) => sum + (c.enrollment_count || 0), 0) || 0;
      const totalRevenue = coursesData.courses?.reduce((sum, c) => sum + ((c.price || 0) * (c.enrollment_count || 0)), 0) || 0;
      const avgRating = coursesData.courses?.length > 0
        ? coursesData.courses.reduce((sum, c) => sum + (c.average_rating || 0), 0) / coursesData.courses.length
        : 0;

      setStats({
        totalCourses: coursesData.courses?.length || 0,
        totalStudents: totalEnrollments,
        avgRating: avgRating.toFixed(1),
        totalRevenue: totalRevenue.toFixed(2)
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, gradient }) => (
    <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`}></div>
      <CardContent className="pt-6 pb-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
            <h3 className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">{value}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-2 font-medium">{subtitle}</p>}
          </div>
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-8 h-8 text-white drop-shadow-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            <p className="text-center text-muted-foreground">Loading dashboard...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                Instructor Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">Manage your courses and track your teaching impact</p>
            </div>
            <Button 
              onClick={() => navigate('/create-course')}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Course
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard
              icon={BookOpen}
              title="Total Courses"
              value={stats?.totalCourses || 0}
              gradient="from-blue-500 to-blue-600"
            />
            <StatCard
              icon={Users}
              title="Total Students"
              value={stats?.totalStudents || 0}
              subtitle="Across all courses"
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              icon={Star}
              title="Average Rating"
              value={stats?.avgRating || 'N/A'}
              subtitle="From student reviews"
              gradient="from-amber-500 to-orange-500"
            />
            <StatCard
              icon={DollarSign}
              title="Total Revenue"
              value={`$${stats?.totalRevenue || 0}`}
              subtitle="Total earnings"
              gradient="from-purple-500 to-pink-500"
            />
          </div>

          {/* Recent Courses */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Your Courses</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/my-courses')} className="border-2 hover:bg-primary hover:text-white transition-colors">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {courses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">No courses yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Start your teaching journey by creating your first amazing course!
                  </p>
                  <Button 
                    onClick={() => navigate('/create-course')}
                    className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Course
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.slice(0, 5).map(course => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xl">
                          {course.title.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{course.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {course.enrollment_count || 0} students
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {course.average_rating ? parseFloat(course.average_rating).toFixed(1) : 'N/A'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                              {course.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate('/my-courses')}>
                          <Eye className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-none shadow-lg mt-8">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50">
              <CardTitle className="text-2xl font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <button 
                  onClick={() => navigate('/create-course')}
                  className="group relative overflow-hidden rounded-xl border-2 border-dashed border-primary/30 hover:border-primary p-8 transition-all hover:shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Plus className="w-7 h-7" />
                    </div>
                    <span className="font-semibold text-lg">Create New Course</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/my-courses')}
                  className="group relative overflow-hidden rounded-xl border-2 border-dashed border-green-300 hover:border-green-500 p-8 transition-all hover:shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <span className="font-semibold text-lg">Manage Courses</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/analytics')}
                  className="group relative overflow-hidden rounded-xl border-2 border-dashed border-purple-300 hover:border-purple-500 p-8 transition-all hover:shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-7 h-7" />
                    </div>
                    <span className="font-semibold text-lg">View Analytics</span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};
