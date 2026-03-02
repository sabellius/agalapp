import type { Review } from "@/generated/prisma/client";

export const mockReview: Review = {
  id: "review-1",
  truckId: "truck-1",
  userId: "user-1",
  rating: 5,
  comment: "קפה מעולה!",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  truck: null,
  user: null,
};

export function buildReview(overrides: Partial<Review> = {}): Review {
  return {
    id: `review-${Math.random().toString(36).slice(2, 9)}`,
    truckId: "truck-1",
    userId: "user-1",
    rating: 5,
    comment: "תגובה",
    createdAt: new Date(),
    updatedAt: new Date(),
    truck: null,
    user: null,
    ...overrides,
  };
}
