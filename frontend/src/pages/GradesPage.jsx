import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { assignmentAPI } from '../services/api';

export const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await assignmentAPI.getGrades();
      setGrades(response.grades);
    } catch (error) {
      console.error('Failed to load grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradePercentage = (grade, maxScore) => {
    return ((grade / maxScore) * 100).toFixed(1);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Grades</h1>
            <p className="text-muted-foreground">View all your assignment and quiz grades</p>
          </div>

          {grades.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No grades yet</h3>
                <p className="text-muted-foreground">Complete assignments and quizzes to see your grades here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {grades.map((submission) => {
                const percentage = submission.grade 
                  ? getGradePercentage(submission.grade, submission.max_score)
                  : null;

                return (
                  <Card key={`${submission.grade_type}-${submission.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{submission.assignment_title}</h3>
                            <Badge variant={submission.grade_type === 'quiz' ? 'default' : 'secondary'}>
                              {submission.grade_type === 'quiz' ? 'Quiz' : 'Assignment'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {submission.course_title} • {submission.lesson_title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Completed on {new Date(submission.submitted_at || submission.completed_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="text-right">
                          {submission.grade !== null && submission.grade !== undefined ? (
                            <>
                              <div className={`text-3xl font-bold ${getGradeColor(percentage)}`}>
                                {submission.grade}/{submission.max_score}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {percentage}%
                              </div>
                              {submission.grade_type === 'quiz' && submission.passed !== null && (
                                <Badge variant={submission.passed ? 'success' : 'destructive'} className="mt-2">
                                  {submission.passed ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                  {submission.passed ? 'Passed' : 'Failed'}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>

                      {submission.grade !== null && (
                        <Progress value={parseFloat(percentage)} className="mb-4" />
                      )}

                      {submission.feedback && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Instructor Feedback:</p>
                          <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                          {submission.grader_name && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Graded by {submission.grader_name} on {new Date(submission.graded_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
