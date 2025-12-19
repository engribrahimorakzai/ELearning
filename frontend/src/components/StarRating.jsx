import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const [hover, setHover] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const starSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            readonly ? 'cursor-default' : 'cursor-pointer'
          } transition-colors ${
            star <= (hover || rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        />
      ))}
    </div>
  );
};
