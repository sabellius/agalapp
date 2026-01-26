"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  readonly?: boolean;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  className,
}: StarRatingProps) {
  const handleStarClick = (rating: number) => {
    if (!readonly) {
      onChange(rating);
    }
  };

  const handleStarMouseEnter = (rating: number) => {
    if (!readonly) {
      onChange(rating);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarMouseEnter(star)}
          onMouseLeave={() => handleStarClick(value)}
          className={cn(
            "transition-transform hover:scale-110 focus:outline-none",
            readonly && "cursor-default",
          )}
          aria-label={`דרג ${star} כוכבים`}
          aria-pressed={star <= value}
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}
