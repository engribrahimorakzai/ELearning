import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { quizAPI } from '../services/api';

export const QuizHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await quizAPI.getQuizHistory();
      setHistory(response.history);
    } catch (error) {
      console.error('Failed to load quiz history:', error);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Quiz History</h1>
            <p className="text-muted-foreground">All your quiz attempts</p>
          </div>

          {history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No quiz attempts yet</h3>
                <p className="text-muted-foreground">Complete quizzes to see your history here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((attempt) => (
                <Card key={attempt.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{attempt.quiz_title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {attempt.course_title} • {attempt.lesson_title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Attempted on {new Date(attempt.started_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {attempt.score}/{attempt.total_points}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Number(attempt.percentage || 0).toFixed(1)}%
                          </div>
                        </div>

                        {attempt.passed ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Badge variant={attempt.passed ? 'success' : 'destructive'}>
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </Badge>
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
