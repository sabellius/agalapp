import { describe, it, expect } from "vitest";
import {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
  type CreateReviewInput,
} from "./review-schema";

describe("createReviewSchema", () => {
  const validReview: CreateReviewInput = {
    truckId: "truck-123",
    rating: 5,
    content: "קפה מעולה, מומלץ מאוד!",
  };

  it("accepts valid review", () => {
    const result = createReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("accepts minimum valid rating (1)", () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts maximum valid rating (5)", () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: 5 });
    expect(result.success).toBe(true);
  });

  it("accepts minimum valid content (10 characters)", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      content: "קפה מעולה!",
    });
    expect(result.success).toBe(true);
  });

  it("accepts maximum valid content (1000 characters)", () => {
    const content = "א".repeat(1000);
    const result = createReviewSchema.safeParse({
      ...validReview,
      content,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing truckId", () => {
    const result = createReviewSchema.safeParse({
      rating: 5,
      content: validReview.content,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty truckId", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      truckId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating below 1", () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects rating above 5", () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects decimal rating", () => {
    const result = createReviewSchema.safeParse({ ...validReview, rating: 3.5 });
    expect(result.success).toBe(false);
  });

  it("rejects content shorter than 10 characters", () => {
    const result = createReviewSchema.safeParse({ ...validReview, content: "קפה טוב" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("מינימום 10");
    }
  });

  it("rejects content longer than 1000 characters", () => {
    const content = "א".repeat(1001);
    const result = createReviewSchema.safeParse({ ...validReview, content });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("מקסימום 1000");
    }
  });

  it("trims content", () => {
    const result = createReviewSchema.safeParse({
      ...validReview,
      content: "  קפה מעולה!  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("קפה מעולה!");
    }
  });
});

describe("updateReviewSchema", () => {
  const validUpdate = {
    reviewId: "review-123",
    rating: 4,
    content: "קפה טוב מאוד, מומלץ!",
  };

  it("accepts valid update", () => {
    const result = updateReviewSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("accepts rating boundaries", () => {
    const result1 = updateReviewSchema.safeParse({ ...validUpdate, rating: 1 });
    const result5 = updateReviewSchema.safeParse({ ...validUpdate, rating: 5 });

    expect(result1.success).toBe(true);
    expect(result5.success).toBe(true);
  });

  it("rejects empty reviewId", () => {
    const result = updateReviewSchema.safeParse({ ...validUpdate, reviewId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid rating", () => {
    const result = updateReviewSchema.safeParse({ ...validUpdate, rating: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects short content", () => {
    const result = updateReviewSchema.safeParse({
      ...validUpdate,
      content: "קצר",
    });
    expect(result.success).toBe(false);
  });
});

describe("deleteReviewSchema", () => {
  it("accepts valid reviewId", () => {
    const result = deleteReviewSchema.safeParse({ reviewId: "review-123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty reviewId", () => {
    const result = deleteReviewSchema.safeParse({ reviewId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing reviewId", () => {
    const result = deleteReviewSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
