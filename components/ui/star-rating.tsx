import { Star } from "lucide-react";
import { MAX_REVIEW_RATING } from "@/lib/validations/review-schema";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StarRating({
  rating,
  maxRating = MAX_REVIEW_RATING,
  size = "md",
  showValue = true,
  reviewCount,
  className = "",
}: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(maxRating, rating));
  const starClass = sizeClasses[size];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className="flex"
        role="img"
        aria-label={`Rating: ${clampedRating.toFixed(1)} out of ${maxRating}`}
      >
        {Array.from({ length: maxRating }, (_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= Math.floor(clampedRating);
          const isPartial =
            starIndex === Math.ceil(clampedRating) && clampedRating % 1 !== 0;
          const fillPercentage = isPartial ? (clampedRating % 1) * 100 : 0;

          return (
            <div key={starIndex} className="relative">
              <Star
                className={`${starClass} fill-transparent text-muted-foreground/30`}
              />
              {(isFilled || isPartial) && (
                <Star
                  className={`${starClass} absolute top-0 left-0 fill-yellow-400 text-yellow-400`}
                  style={
                    isPartial
                      ? { clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }
                      : undefined
                  }
                />
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium">{clampedRating.toFixed(1)}</span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
}
