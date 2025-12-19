import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { StarRating } from './StarRating';
import { reviewAPI } from '../services/api';
import { ThumbsUp, MessageCircle, MoreVertical } from 'lucide-react';

export const ReviewList = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [votedReviews, setVotedReviews] = useState(new Set());

  useEffect(() => {
    loadReviews();
  }, [courseId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewAPI.getCourseReviews(courseId);
      setReviews(data.reviews || []);
    } catch (err) {
      setError('Failed to load reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteHelpful = async (reviewId) => {
    if (votedReviews.has(reviewId)) {
      return; // Already voted
    }

    try {
      await reviewAPI.voteReview(reviewId, { is_helpful: true });
      setVotedReviews(new Set([...votedReviews, reviewId]));
      
      // Update local state
      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r
      ));
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No reviews yet. Be the first to review this course!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar className="w-12 h-12 flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {getInitials(review.student_name)}
                </div>
              </Avatar>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{review.student_name || 'Anonymous'}</h4>
                    <p className="text-sm text-muted-foreground">{formatDate(review.created_at)}</p>
                  </div>
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>

                <p className="text-muted-foreground mb-3">{review.comment}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVoteHelpful(review.id)}
                    disabled={votedReviews.has(review.id)}
                    className="h-8"
                  >
                    <ThumbsUp className={`w-4 h-4 mr-1 ${votedReviews.has(review.id) ? 'fill-primary' : ''}`} />
                    Helpful ({review.helpful_count || 0})
                  </Button>

                  {/* Instructor Reply */}
                  {review.instructor_reply && (
                    <div className="mt-4 ml-8 p-3 bg-accent/50 rounded-md">
                      <p className="text-sm font-semibold mb-1">Instructor Response:</p>
                      <p className="text-sm text-muted-foreground">{review.instructor_reply}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(review.reply_date)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
