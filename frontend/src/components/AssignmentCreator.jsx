import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { assignmentAPI } from '../services/api';
import { Calendar, Save, FileText } from 'lucide-react';

export const AssignmentCreator = ({ lessonId, onSave }) => {
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    due_date: '',
    max_score: 100
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssignment(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!assignment.title.trim()) {
      setError('Assignment title is required');
      return;
    }

    try {
      setLoading(true);
      await assignmentAPI.createAssignment(lessonId, assignment);
      setSuccess('Assignment created successfully!');
      
      setTimeout(() => {
        if (onSave) onSave();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Assignment</CardTitle>
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
          <label className="block text-sm font-medium mb-2">Assignment Title *</label>
          <Input
            name="title"
            value={assignment.title}
            onChange={handleChange}
            placeholder="e.g., Build a Todo App"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={assignment.description}
            onChange={handleChange}
            placeholder="Brief description of the assignment"
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Instructions</label>
          <textarea
            name="instructions"
            value={assignment.instructions}
            onChange={handleChange}
            placeholder="Detailed instructions for students"
            className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <Input
              type="date"
              name="due_date"
              value={assignment.due_date}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Score</label>
            <Input
              type="number"
              name="max_score"
              value={assignment.max_score}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Creating...' : 'Create Assignment'}
        </Button>
      </CardContent>
    </Card>
  );
};
