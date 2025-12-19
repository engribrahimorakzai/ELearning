import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { assignmentAPI, uploadAPI } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const AssignmentPage = () => {
  const { id: assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const data = await assignmentAPI.getAssignment(assignmentId);
      setAssignment(data.assignment);
      
      // Check if student already submitted
      try {
        const subData = await assignmentAPI.getSubmission(assignmentId);
        setSubmission(subData.submission);
        setSubmissionText(subData.submission?.submission_text || '');
      } catch (err) {
        // No submission yet
        setSubmission(null);
      }
    } catch (err) {
      setError('Failed to load assignment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!submissionText.trim() && !selectedFile) {
      setError('Please provide submission text or upload a file');
      return;
    }

    try {
      setSubmitting(true);
      
      let fileUrl = '';
      
      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadData = await uploadAPI.upload(formData, 'document');
        fileUrl = uploadData.url;
      }

      // Submit assignment
      await assignmentAPI.submitAssignment(assignmentId, {
        submission_text: submissionText,
        file_url: fileUrl
      });

      setSuccess('Assignment submitted successfully!');
      setTimeout(() => {
        loadAssignment(); // Reload to show submitted state
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = () => {
    if (!assignment?.due_date) return false;
    return new Date(assignment.due_date) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    if (!submission) {
      return isOverdue() ? (
        <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      ) : (
        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      );
    }
    
    if (submission.grade !== null) {
      return <Badge className="bg-green-100 text-green-800">Graded</Badge>;
    }
    
    return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto p-8">
          <p className="text-center text-muted-foreground">Loading assignment...</p>
        </main>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto p-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <p className="text-red-600">{error}</p>
              <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-4xl mx-auto p-8">
        {/* Assignment Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
                <p className="text-muted-foreground">{assignment.description}</p>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Due: {formatDate(assignment.due_date)}</span>
                {isOverdue() && <span className="text-red-600 font-semibold">(Overdue)</span>}
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Max Score: {assignment.max_score}</span>
              </div>
            </div>

            {assignment.instructions && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                  {assignment.instructions}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submission Status or Form */}
        {submission && submission.grade !== null ? (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Assignment Graded
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {submission.grade}/{assignment.max_score}
                  </div>
                  <p className="text-sm text-muted-foreground">Your Score</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round((submission.grade / assignment.max_score) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                </div>
              </div>

              {submission.feedback && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Instructor Feedback:</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{submission.feedback}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Your Submission:</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{submission.submission_text}</p>
                {submission.file_url && (
                  <Button variant="outline" className="mt-2" asChild>
                    <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      View Submitted File
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : submission ? (
          <Card className="border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-500" />
                Submission Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You submitted this assignment on {new Date(submission.submitted_at).toLocaleDateString()}.
                Your instructor will grade it soon.
              </p>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Your Submission:</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{submission.submission_text}</p>
                {submission.file_url && (
                  <Button variant="outline" className="mt-2" asChild>
                    <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      View Submitted File
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Submit Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
                  {success}
                </div>
              )}

              {isOverdue() && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm">
                  ⚠️ This assignment is overdue. Late submissions may receive reduced credit.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Your Answer</label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload File (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed rounded-md p-4 text-center hover:bg-accent/50 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      {selectedFile ? (
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Click to upload PDF, DOC, or ZIP (Max 10MB)
                        </p>
                      )}
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.zip"
                      className="hidden"
                      disabled={submitting}
                    />
                  </label>
                </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={submitting || (!submissionText.trim() && !selectedFile)}
                className="w-full"
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};
