import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 4.8, reviewCount = null, size = 'sm' }) {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSizes[size]} ${
              star <= Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : star - 0.5 <= rating
                ? 'fill-amber-200 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-slate-700 ml-0.5">{rating.toFixed(1)}</span>
      {reviewCount !== null && (
        <span className="text-xs text-slate-400 font-normal">({reviewCount})</span>
      )}
    </div>
  );
}
