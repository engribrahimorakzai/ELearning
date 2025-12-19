import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Users, BookOpen } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { instructorAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const EarningsPage = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await instructorAPI.getEarnings({ period: '365' });
      setEarnings(response.earnings);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalEnrollments = earnings?.courseBreakdown?.reduce((sum, course) => sum + course.enrollments, 0) || 0;
  const topCourse = earnings?.courseBreakdown?.[0] || null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Earnings Dashboard</h1>
            <p className="text-muted-foreground">Track your income and course performance</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${earnings?.total ? parseFloat(earnings.total).toFixed(2) : '0.00'}</div>
                <p className="text-xs text-muted-foreground">Lifetime revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEnrollments}</div>
                <p className="text-xs text-muted-foreground">Across all courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{earnings?.courseBreakdown?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Published courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Course Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${topCourse?.revenue ? parseFloat(topCourse.revenue).toFixed(2) : '0.00'}</div>
                <p className="text-xs text-muted-foreground">{topCourse?.title || 'N/A'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Earnings Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earnings?.monthlyBreakdown || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="earnings" stroke="#6366f1" strokeWidth={2} name="Earnings" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Course Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Course</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={earnings?.courseBreakdown?.slice(0, 5) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#6366f1" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Course Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Course</th>
                      <th className="text-right py-3 px-4">Price</th>
                      <th className="text-right py-3 px-4">Enrollments</th>
                      <th className="text-right py-3 px-4">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings?.courseBreakdown?.map((course) => (
                      <tr key={course.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{course.title}</td>
                        <td className="py-3 px-4 text-right">${parseFloat(course.price).toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">{course.enrollments}</td>
                        <td className="py-3 px-4 text-right font-semibold text-green-600">
                          ${parseFloat(course.revenue).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};
