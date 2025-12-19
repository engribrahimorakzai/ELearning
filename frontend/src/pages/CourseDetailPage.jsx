import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Star, Users, Clock, Play, CheckCircle, FileText, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewList } from '../components/ReviewList';
import { formatPrice, formatDuration } from '../lib/utils';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const [courseData, curriculumData, reviewsData] = await Promise.all([
        courseAPI.getById(id),
        courseAPI.getCurriculum(id),
        courseAPI.getReviews(id, { limit: 5 })
      ]);
      setCourse(courseData.course);
      setCurriculum(curriculumData.curriculum || []);
      setReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is a student
    if (user.role !== 'student') {
      toast.error('Only students can enroll in courses. Please login with a student account.');
      return;
    }

    setEnrolling(true);
    try {
      await courseAPI.enroll(id);
      toast.success('Successfully enrolled in course!');
      setTimeout(() => navigate(`/course/${id}/learn`), 1000);
    } catch (error) {
      console.error('Enrollment error:', error);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      
      const errorMsg = error.response?.data?.error || error.message || 'Already enrolled in this course';
      
      // Check status code for already enrolled (409 Conflict)
      if (error.response?.status === 409 || errorMsg.toLowerCase().includes('already enrolled')) {
        toast.error('Already enrolled in this course');
      } else if (errorMsg.toLowerCase().includes('permissions') || errorMsg.toLowerCase().includes('access denied')) {
        toast.error('Only students can enroll in courses');
      } else if (errorMsg.toLowerCase().includes('not available')) {
        toast.error('This course is not available for enrollment');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setEnrolling(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  const totalLessons = curriculum.reduce((sum, section) => sum + (section.lessons?.length || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg mb-6 opacity-90">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{course.average_rating?.toFixed(1) || 'New'}</span>
                  <span className="opacity-75">({course.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-5 w-5" />
                  <span>{course.enrollment_count} students</span>
                </div>
              </div>

              <p className="text-sm opacity-90">
                Created by <span className="font-semibold">{course.instructor_name}</span>
              </p>
            </div>

            {/* Enroll Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <img
                  src={course.thumbnail || course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'; }}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-4">
                    {course.price === 0 ? 'Free' : formatPrice(course.price)}
                  </div>
                  
                  {user?.role === 'student' ? (
                    <Button onClick={handleEnroll} className="w-full mb-4" size="lg" disabled={enrolling}>
                      {enrolling ? 'Enrolling...' : course.is_enrolled ? 'Go to Course' : 'Enroll Now'}
                    </Button>
                  ) : user?.role === 'admin' || user?.role === 'instructor' ? (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      <p className="font-medium">👤 {user.role === 'admin' ? 'Admin' : 'Instructor'} View</p>
                      <p className="text-xs mt-1">Login with a student account to enroll</p>
                    </div>
                  ) : (
                    <Button onClick={() => navigate('/login')} className="w-full mb-4" size="lg">
                      Login to Enroll
                    </Button>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lessons</span>
                      <span className="font-medium">{totalLessons}</span>
                    </div>
                    {course.duration && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{formatDuration(course.duration)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium">{course.level || 'All Levels'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Curriculum */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
          <div className="space-y-2">
            {curriculum.map((section, idx) => (
              <Card key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">Section {idx + 1}: {section.title}</span>
                    <Badge variant="secondary">{section.lessons?.length || 0} lessons</Badge>
                  </div>
                  {expandedSections[section.id] ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                
                {expandedSections[section.id] && (
                  <div className="border-t">
                    {section.lessons?.map((lesson) => (
                      <div key={lesson.id} className="p-4 border-b last:border-b-0 flex items-center gap-3">
                        {lesson.lesson_type === 'video' && <Play className="h-4 w-4 text-muted-foreground" />}
                        {lesson.lesson_type === 'quiz' && <CheckCircle className="h-4 w-4 text-muted-foreground" />}
                        {lesson.lesson_type === 'text' && <FileText className="h-4 w-4 text-muted-foreground" />}
                        <span className="text-sm">{lesson.title}</span>
                        {lesson.duration && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDuration(lesson.duration)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
          
          {/* Write Review (only for enrolled students) */}
          {course?.is_enrolled && user?.role === 'student' && (
            <div className="mb-8">
              <ReviewForm 
                courseId={id} 
                onReviewSubmitted={fetchCourseData}
              />
            </div>
          )}

          {/* Reviews List */}
          <ReviewList courseId={id} />
        </section>
      </div>
    </div>
  );
};
