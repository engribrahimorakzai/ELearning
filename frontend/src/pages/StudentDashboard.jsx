import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, TrendingUp, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardAPI.student();
        setData(response);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = data?.stats || {
    enrolled_courses: 0,
    completed_courses: 0,
    in_progress_courses: 0,
    certificates_earned: 0
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.full_name}! 👋
            </h1>
            <p className="text-muted-foreground">
              Continue your learning journey and achieve your goals
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.enrolled_courses}</div>
                <p className="text-xs text-muted-foreground">Active learning paths</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.in_progress_courses}</div>
                <p className="text-xs text-muted-foreground">Courses to complete</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed_courses}</div>
                <p className="text-xs text-muted-foreground">Courses finished</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.certificates_earned}</div>
                <p className="text-xs text-muted-foreground">Achievements earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Continue Learning Section */}
          {data?.in_progress_courses && data.in_progress_courses.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.in_progress_courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition">
                    <img
                      src={course.thumbnail || course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'; }}
                      alt={course.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{course.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={course.progress || 0} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {course.progress || 0}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {course.completed_lessons || 0} of {course.total_lessons || 0} lessons completed
                      </p>
                    </div>
                    <Link to={`/course/${course.id}/learn`}>
                      <Button>
                        <Play className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Quizzes & Assignments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Quizzes */}
            {data?.recent_quizzes && data.recent_quizzes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Quizzes</CardTitle>
                  <CardDescription>Your latest quiz attempts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.recent_quizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground">{quiz.course_title}</p>
                      </div>
                      <Badge variant={quiz.passed ? 'success' : 'destructive'}>
                        {quiz.score}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Pending Assignments */}
            {data?.pending_assignments && data.pending_assignments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Assignments</CardTitle>
                  <CardDescription>Complete your assignments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.pending_assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">{assignment.course_title}</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={`/assignment/${assignment.id}`}>
                        <Button size="sm" variant="outline">Submit</Button>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Empty State */}
          {stats.enrolled_courses === 0 && (
            <Card className="mt-8">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start Your Learning Journey</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Browse our extensive course catalog and enroll in courses that interest you
                </p>
                <Link to="/courses">
                  <Button size="lg">
                    Browse Courses
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};
