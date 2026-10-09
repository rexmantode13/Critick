import React, { useState } from 'react';
import './RatingStars.css';

export const RatingStars = ({
  rating = 0,
  maxRating = 5,
  size = 'medium', // small | medium | large
  interactive = false,
  onChange,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={`rating-stars rating-stars-${size} ${interactive ? 'interactive' : ''}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.floor(displayRating);
        const isHalf = starValue > Math.floor(displayRating) && starValue <= Math.ceil(displayRating) && displayRating % 1 !== 0;

        return (
          <span
            key={starValue}
            className={`star ${isFilled ? 'filled' : ''} ${isHalf ? 'half' : ''}`}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            role={interactive ? 'button' : 'img'}
            aria-label={`${starValue} out of ${maxRating} stars`}
            tabIndex={interactive ? 0 : -1}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};
