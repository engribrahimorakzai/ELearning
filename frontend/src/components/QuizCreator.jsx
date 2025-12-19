import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { quizAPI } from '../services/api';
import { Plus, Trash2, Save, CheckCircle } from 'lucide-react';

export const QuizCreator = ({ lessonId, onSave }) => {
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    time_limit: 30,
    passing_score: 70,
    max_attempts: 3
  });

  const [questions, setQuestions] = useState([{
    question_text: '',
    question_type: 'multiple_choice',
    points: 10,
    options: ['', '', '', ''],
    correct_answer: 0
  }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setQuestions(prev => prev.map((q, i) => 
      i === qIndex ? { ...q, [field]: value } : q
    ));
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === qIndex) {
        const newOptions = [...q.options];
        newOptions[optIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      question_type: 'multiple_choice',
      points: 10,
      options: ['', '', '', ''],
      correct_answer: 0
    }]);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length === 1) {
      alert('Quiz must have at least one question');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== qIndex));
  };

  const validateQuiz = () => {
    if (!quiz.title.trim()) {
      setError('Quiz title is required');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }
      if (q.options.some(opt => !opt.trim())) {
        setError(`Question ${i + 1} has empty options`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateQuiz()) return;

    try {
      setLoading(true);
      
      // Create quiz
      const quizData = await quizAPI.createQuiz(lessonId, quiz);
      const quizId = quizData.quiz.id;

      // Create questions
      for (const question of questions) {
        await quizAPI.createQuestion(quizId, {
          ...question,
          options: JSON.stringify(question.options)
        });
      }

      setSuccess('Quiz created successfully!');
      setTimeout(() => {
        if (onSave) onSave();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
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

          <div>
            <label className="block text-sm font-medium mb-2">Quiz Title *</label>
            <Input
              name="title"
              value={quiz.title}
              onChange={handleQuizChange}
              placeholder="e.g., Chapter 1 Quiz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={quiz.description}
              onChange={handleQuizChange}
              placeholder="Brief description of the quiz"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
              <Input
                type="number"
                name="time_limit"
                value={quiz.time_limit}
                onChange={handleQuizChange}
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
              <Input
                type="number"
                name="passing_score"
                value={quiz.passing_score}
                onChange={handleQuizChange}
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Attempts</label>
              <Input
                type="number"
                name="max_attempts"
                value={quiz.max_attempts}
                onChange={handleQuizChange}
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      {questions.map((question, qIndex) => (
        <Card key={qIndex}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(qIndex)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question Text *</label>
              <textarea
                value={question.question_text}
                onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                placeholder="Enter your question here"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Points</label>
              <Input
                type="number"
                value={question.points}
                onChange={(e) => handleQuestionChange(qIndex, 'points', e.target.value)}
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Options *</label>
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="radio"
                        name={`correct_${qIndex}`}
                        checked={question.correct_answer === optIndex}
                        onChange={() => handleQuestionChange(qIndex, 'correct_answer', optIndex)}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        className={question.correct_answer === optIndex ? 'border-green-500' : ''}
                      />
                    </div>
                    {question.correct_answer === optIndex && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Select the correct answer by clicking the radio button
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-3">
        <Button variant="outline" onClick={addQuestion}>
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
        <Button onClick={handleSubmit} disabled={loading} className="ml-auto">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Creating Quiz...' : 'Create Quiz'}
        </Button>
      </div>
    </div>
  );
};
