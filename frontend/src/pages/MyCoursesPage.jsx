import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { courseAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Star, BookOpen, Eye, EyeOff } from 'lucide-react';
import { CurriculumBuilder } from '../components/CurriculumBuilder';

export const MyCoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      const data = await courseAPI.getInstructorCourses();
      setCourses(data.courses || []);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;

    try {
      await courseAPI.deleteCourse(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  const handleStatusChange = async (courseId, newStatus) => {
    try {
      await courseAPI.updateCourse(courseId, { status: newStatus });
      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      alert('Failed to update course status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            <Button 
              variant="outline" 
              onClick={() => setSelectedCourse(null)}
              className="mb-6"
            >
              ← Back to My Courses
            </Button>
            <h1 className="text-3xl font-bold mb-2">{selectedCourse.title}</h1>
            <p className="text-muted-foreground mb-8">Build your course curriculum</p>
            <CurriculumBuilder courseId={selectedCourse.id} />
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Courses</h1>
              <p className="text-muted-foreground">Manage your courses and track student progress</p>
            </div>
            <Button onClick={() => navigate('/create-course')}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6">Create your first course to start teaching</p>
                <Button onClick={() => navigate('/create-course')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {courses.map(course => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Thumbnail */}
                      <div className="w-48 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-2xl">
                        {course.thumbnail || course.thumbnail_url ? (
                          <img 
                            src={course.thumbnail || course.thumbnail_url} 
                            alt={course.title} 
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'; }}
                          />
                        ) : (
                          course.title.charAt(0)
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          </div>
                          <Badge className={getStatusColor(course.status)}>
                            {course.status}
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 mt-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{course.enrollment_count || 0} students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{course.average_rating ? parseFloat(course.average_rating).toFixed(1) : 'N/A'} ({course.review_count || 0} reviews)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                            <span>${course.price || 0}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedCourse(course)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Curriculum
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/course/${course.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          {course.status === 'published' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusChange(course.id, 'draft')}
                            >
                              <EyeOff className="w-4 h-4 mr-2" />
                              Unpublish
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleStatusChange(course.id, 'published')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Publish
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(course.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
