import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { StarRating } from './StarRating';
import { reviewAPI } from '../services/api';
import { Send } from 'lucide-react';

export const ReviewForm = ({ courseId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a review');
      return;
    }

    try {
      setLoading(true);
      await reviewAPI.createReview(courseId, { rating, comment });
      setSuccess('Thank you for your review!');
      
      setTimeout(() => {
        setRating(0);
        setComment('');
        setSuccess('');
        if (onReviewSubmitted) onReviewSubmitted();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
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
          <label className="block text-sm font-medium mb-2">Your Rating</label>
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          {rating > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this course..."
            className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={loading}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">{comment.length}/500 characters</p>
        </div>

        <Button onClick={handleSubmit} disabled={loading || rating === 0 || !comment.trim()} className="w-full">
          <Send className="w-4 h-4 mr-2" />
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardContent>
    </Card>
  );
};
