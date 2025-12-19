import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Award, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';

export const HomePage = () => {
  const [stats, setStats] = useState({
    total_courses: 0,
    total_students: 0,
    total_instructors: 0,
    total_enrollments: 0
  });
  const [loading, setLoading] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Learn Without Limits';
  
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
    
    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stats/platform');
        const data = response.data;
        setStats({
          total_courses: data.courses || 0,
          total_students: data.students || 0,
          total_instructors: data.instructors || 0,
          total_enrollments: data.enrollments || 0
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">EduLearn</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="relative overflow-hidden group moving-border-btn">
                <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 animate-border-spin"></span>
                <span className="absolute inset-[2px] rounded-md bg-white"></span>
                <span className="relative z-10">Login</span>
              </Button>
            </Link>
            <Link to="/register">
              <Button className="relative overflow-hidden group moving-border-btn">
                <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-border-spin"></span>
                <span className="absolute inset-[2px] rounded-md bg-blue-600 group-hover:bg-blue-700 transition-colors"></span>
                <span className="relative z-10 text-white">Get Started</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x inline-block min-h-[1.2em]">
              {displayedText}
              <span className="animate-blink">|</span>
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access thousands of courses taught by expert instructors. Advance your career, 
            learn new skills, and achieve your goals.
          </p>
          <div className="flex justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 relative overflow-hidden group moving-border-btn">
                <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-border-spin"></span>
                <span className="absolute inset-[2px] rounded-md bg-blue-600 group-hover:bg-blue-700 transition-colors"></span>
                <span className="relative z-10 text-white">Start Learning Free</span>
                <ArrowRight className="ml-2 h-5 w-5 relative z-10 text-white group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="text-lg px-8 relative overflow-hidden group moving-border-btn">
                <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-border-spin"></span>
                <span className="absolute inset-[2px] rounded-md bg-white group-hover:bg-gradient-to-r group-hover:from-blue-50 group-hover:to-purple-50 transition-all"></span>
                <span className="relative z-10">Browse Courses</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert-Led Courses</h3>
                <p className="text-muted-foreground">
                  Learn from industry professionals and experienced educators
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Global Community</h3>
                <p className="text-muted-foreground">
                  Join millions of learners from around the world
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn Certificates</h3>
                <p className="text-muted-foreground">
                  Get recognized for your achievements with verified certificates
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group hover:scale-110 transition-transform duration-300 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <div className="relative">
                  <div className="text-4xl font-bold text-primary mb-2 group-hover:animate-bounce">
                    {stats.total_courses?.toLocaleString() || 0}
                  </div>
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-muted-foreground">Courses Available</div>
              </div>
              <div className="group hover:scale-110 transition-transform duration-300 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="relative">
                  <div className="text-4xl font-bold text-primary mb-2 group-hover:animate-bounce">
                    {stats.total_students?.toLocaleString() || 0}
                  </div>
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-muted-foreground">Active Students</div>
              </div>
              <div className="group hover:scale-110 transition-transform duration-300 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <div className="relative">
                  <div className="text-4xl font-bold text-primary mb-2 group-hover:animate-bounce">
                    {stats.total_instructors?.toLocaleString() || 0}
                  </div>
                  <div className="absolute inset-0 bg-pink-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-muted-foreground">Expert Instructors</div>
              </div>
              <div className="group hover:scale-110 transition-transform duration-300 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <div className="relative">
                  <div className="text-4xl font-bold text-primary mb-2 group-hover:animate-bounce">
                    {stats.total_enrollments?.toLocaleString() || 0}
                  </div>
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-muted-foreground">Total Enrollments</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community today and unlock your potential
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Sign Up Now - It's Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 ELearning. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
