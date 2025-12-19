import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Star, Users, Clock, DollarSign, Filter, X, Edit, Trash2 } from 'lucide-react';
import { courseAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { formatPrice, formatDuration } from '../lib/utils';

export const CourseBrowsePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category_id: searchParams.get('category_id') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_rating: searchParams.get('min_rating') || '',
    sort: searchParams.get('sort') || 'newest'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const data = await courseAPI.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });
      const response = await courseAPI.browse(params);
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) params[key] = filters[key];
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      min_price: '',
      max_price: '',
      min_rating: '',
      sort: 'newest'
    });
    setSearchParams({});
  };

  const handleDeleteCourse = async (e, courseId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    
    try {
      await adminAPI.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handleEditCourse = (e, courseId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-course/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Explore Courses</h1>
            <p className="text-muted-foreground">
              Discover world-class courses taught by expert instructors
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <aside className="col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Filters</CardTitle>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <Input
                      placeholder="Course title..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={filters.category_id}
                      onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.min_price}
                        onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.max_price}
                        onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Rating</label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={filters.min_rating}
                      onChange={(e) => setFilters({ ...filters, min_rating: e.target.value })}
                    >
                      <option value="">All Ratings</option>
                      <option value="4.5">4.5★ & up</option>
                      <option value="4.0">4.0★ & up</option>
                      <option value="3.5">3.5★ & up</option>
                      <option value="3.0">3.0★ & up</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={filters.sort}
                      onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    >
                      <option value="newest">Newest</option>
                      <option value="rating">Highest Rated</option>
                      <option value="popularity">Most Popular</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                    </select>
                  </div>

                  <Button onClick={applyFilters} className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Courses Grid */}
            <div className="col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : courses.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Filter className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="relative">
                      <Link to={`/course/${course.id}`}>
                        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                          <img
                            src={course.thumbnail || course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                            alt={course.title}
                            className="w-full h-40 object-cover rounded-t-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
                            }}
                          />
                          <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {course.description}
                          </p>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-medium">
                                {course.average_rating?.toFixed(1) || 'New'}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ({course.review_count || 0} reviews)
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {course.enrollment_count || 0}
                            </div>
                            {course.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDuration(course.duration)}
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground mb-3">
                            By {course.instructor_name}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-primary">
                              {course.price === 0 ? 'Free' : formatPrice(course.price)}
                            </span>
                            {course.is_featured && (
                              <Badge variant="secondary">Featured</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-white hover:bg-blue-50 shadow-md"
                          onClick={(e) => handleEditCourse(e, course.id)}
                          title="Edit Course"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-white hover:bg-red-50 shadow-md"
                          onClick={(e) => handleDeleteCourse(e, course.id)}
                          title="Delete Course"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
