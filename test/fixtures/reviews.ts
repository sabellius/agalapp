import type { Review } from "@/generated/prisma/client";

export const mockReview: Review = {
  id: "review-1",
  truckId: "truck-1",
  userId: "user-1",
  rating: 5,
  content: "קפה מעולה!",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

export function buildReview(overrides: Partial<Review> = {}): Review {
  return {
    id: `review-${Math.random().toString(36).slice(2, 9)}`,
    truckId: "truck-1",
    userId: "user-1",
    rating: 5,
    content: "תגובה",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
