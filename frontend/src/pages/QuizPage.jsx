import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { CertificateDisplay } from '../components/CertificateDisplay';
import { quizAPI } from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Award, RotateCcw, Download } from 'lucide-react';

export const QuizPage = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [alreadyPassed, setAlreadyPassed] = useState(false);
  const [previousResult, setPreviousResult] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      console.log('🎯 Loading quiz with ID:', quizId);
      
      if (!quizId || quizId === 'undefined' || quizId === 'null') {
        throw new Error('Invalid quiz ID');
      }
      
      const quizData = await quizAPI.getQuiz(quizId);
      console.log('📝 Quiz data:', quizData);
      
      setQuiz(quizData.quiz);
      setQuestions(quizData.quiz.questions || []);
      
      // Check if student already passed this quiz
      if (quizData.previous_attempts && quizData.previous_attempts.length > 0) {
        const passedAttempt = quizData.previous_attempts.find(attempt => attempt.passed);
        if (passedAttempt) {
          setAlreadyPassed(true);
          setPreviousResult(passedAttempt);
          setLoading(false);
          return;
        }
      }
      
      setTimeLeft(quizData.quiz.time_limit); // Time limit is already in seconds
      
      // Start quiz attempt
      const attemptResponse = await quizAPI.startAttempt(quizId);
      console.log('🎯 Quiz attempt started:', attemptResponse);
      setAttemptId(attemptResponse.attempt.id);
    } catch (err) {
      setError('Failed to load quiz');
      console.error('❌ Quiz loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (!attemptId) {
        throw new Error('No quiz attempt found');
      }
      
      // Convert index (0,1,2,3) to letter (A,B,C,D)
      const indexToLetter = (idx) => idx !== null && idx !== undefined ? String.fromCharCode(65 + idx) : null;
      
      const answersObject = {};
      questions.forEach((q, index) => {
        if (answers[index] !== undefined) {
          answersObject[q.id] = indexToLetter(answers[index]);
        }
      });

      const response = await quizAPI.submit(attemptId, { attempt_id: attemptId, answers: answersObject });
      
      // Check if certificate was generated
      if (response.certificate_generated && response.certificate) {
        setCertificate(response.certificate);
      }
      setResult(response.result);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setTimeLeft(quiz.time_limit * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownloadPDF = () => {
    if (!certificate) return;
    // Trigger the certificate modal and print
    setShowCertificate(true);
    // Delay to allow modal to render
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto p-8">
          <p className="text-center text-muted-foreground">Loading quiz...</p>
        </main>
      </div>
    );
  }

  if (alreadyPassed && previousResult) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto p-8">
          <Card className="border-2 border-green-500">
            <CardContent className="py-12 text-center">
              <div className="mb-6">
                <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Quiz Already Completed! ✅</h2>
                <p className="text-muted-foreground mb-6">
                  You have already passed this quiz. You cannot attempt it again.
                </p>
              </div>
              
              <div className="max-w-md mx-auto mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {previousResult.percentage}%
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Your Score</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-green-600">{previousResult.score || 0}</div>
                      <div className="text-muted-foreground">Points</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Passed
                      </div>
                      <div className="text-muted-foreground">Status</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => navigate(-1)} size="lg">
                Back to Course
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto p-8">
          <Card>
            <CardContent className="py-12 text-center">
              <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <p className="text-red-600">{error}</p>
              <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (submitted && result) {
    const passed = result.score >= quiz.passing_score;
    const correctCount = result.correct_answers || 0;
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0);

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-4xl mx-auto p-8">
          {/* Download PDF Button */}
          {certificate && passed && (
            <div className="mb-4 flex justify-end">
              <Button 
                onClick={handleDownloadPDF}
                className="gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                <Download className="w-4 h-4" />
                Download Certificate (PDF)
              </Button>
            </div>
          )}
          
          <Card className={passed ? 'border-2 border-green-500' : 'border-2 border-red-500'}>
            <CardHeader className="text-center">
              {passed ? (
                <Award className="w-20 h-20 mx-auto text-green-500 mb-4" />
              ) : (
                <XCircle className="w-20 h-20 mx-auto text-red-500 mb-4" />
              )}
              <CardTitle className="text-3xl">
                {passed ? 'Congratulations! 🎉' : 'Keep Trying!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">
                  {result.score}%
                </div>
                <p className="text-muted-foreground">Your Score</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{questions.length - correctCount}</div>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totalPoints}</div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="text-center text-muted-foreground mb-4">
                  Passing Score: {quiz.passing_score}%
                </p>
                {passed ? (
                  <p className="text-center text-green-600 font-semibold">
                    ✓ You passed this quiz!
                  </p>
                ) : (
                  <p className="text-center text-red-600 font-semibold">
                    ✗ You need {quiz.passing_score}% to pass
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
                {certificate && passed && (
                  <Button onClick={() => setShowCertificate(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <Award className="w-4 h-4 mr-2" />
                    View Certificate
                  </Button>
                )}
                {result.attempts_count < quiz.max_attempts && !passed && (
                  <Button onClick={handleRetake}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake Quiz ({result.attempts_count}/{quiz.max_attempts})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
        
        {/* Certificate Display Modal */}
        {showCertificate && certificate && (
          <CertificateDisplay 
            certificateData={certificate}
            onClose={() => setShowCertificate(false)}
          />
        )}
      </div>
    );
  }

  const question = questions[currentQuestion];
  const options = question ? [
    question.option_a,
    question.option_b,
    question.option_c,
    question.option_d
  ].filter(Boolean) : [];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-4xl mx-auto p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>{quiz.title}</CardTitle>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="w-5 h-5" />
                <span className={timeLeft < 60 ? 'text-red-600' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">{question?.question}</h3>
              <p className="text-sm text-muted-foreground mb-4">{question?.points || 10} points</p>
              
              <div className="space-y-3">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentQuestion] === index
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion] === index
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQuestion] === index && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer ${
                      answers[index] !== undefined
                        ? 'bg-primary text-white'
                        : index === currentQuestion
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
