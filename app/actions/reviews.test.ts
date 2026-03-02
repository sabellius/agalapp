import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies before importing actions
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $disconnect: vi.fn(),
    user: {
      findUnique: vi.fn(),
    },
    coffeeTruck: {
      findUnique: vi.fn(),
    },
    review: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers({ "user-agent": "test" }))),
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mockReview } from "@/test/fixtures/reviews";
import { mockUser } from "@/test/fixtures/users";
import { createReview, deleteReview, updateReview } from "./reviews";

const mockPrisma = prisma as typeof prisma & {
  coffeeTruck: { findUnique: ReturnType<typeof vi.fn> };
  review: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

const mockAuth = auth as typeof auth & {
  api: { getSession: ReturnType<typeof vi.fn> };
};

describe("reviews server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createReview", () => {
    const validInput = {
      truckId: "truck-123",
      rating: 5,
      content: "קפה מעולה, מומלץ מאוד!",
    };

    it("creates review for authenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({ id: "truck-123" });
      mockPrisma.review.findUnique.mockResolvedValue(null);
      mockPrisma.review.create.mockResolvedValue({
        id: "review-123",
        ...mockReview,
      });

      const result = await createReview(validInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockPrisma.review.create).toHaveBeenCalledWith({
        data: {
          rating: validInput.rating,
          content: validInput.content,
          truckId: validInput.truckId,
          userId: mockUser.id,
        },
      });
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await createReview(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("אינך מחובר");
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });

    it("rejects when truck not found", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue(null);

      const result = await createReview(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("העגלה לא נמצאה");
    });

    it("rejects duplicate review for same truck", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({ id: "truck-123" });
      mockPrisma.review.findUnique.mockResolvedValue({ id: "existing-review" });

      const result = await createReview(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toContain("כבר כתבת ביקורת");
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });

    it("validates input with Zod", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      const invalidInput = { ...validInput, rating: 6 };

      const result = await createReview(invalidInput);

      expect(result.success).toBe(false);
      expect(mockPrisma.review.create).not.toHaveBeenCalled();
    });

    it("validates content length", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      const invalidInput = { ...validInput, content: "קצר" };

      const result = await createReview(invalidInput);

      expect(result.success).toBe(false);
    });

    it("accepts minimum valid content (10 characters)", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({ id: "truck-123" });
      mockPrisma.review.findUnique.mockResolvedValue(null);
      mockPrisma.review.create.mockResolvedValue({
        id: "review-123",
        ...mockReview,
      });

      const validMinInput = { ...validInput, content: "0123456789" };

      const result = await createReview(validMinInput);

      expect(result.success).toBe(true);
    });

    it("accepts rating boundaries", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({ id: "truck-123" });
      mockPrisma.review.findUnique.mockResolvedValue(null);
      mockPrisma.review.create.mockResolvedValue({
        id: "review-123",
        ...mockReview,
      });

      const result1 = await createReview({ ...validInput, rating: 1 });
      const result5 = await createReview({ ...validInput, rating: 5 });

      expect(result1.success).toBe(true);
      expect(result5.success).toBe(true);
    });
  });

  describe("updateReview", () => {
    const validInput = {
      reviewId: "review-123",
      rating: 4,
      content: "עודכן - קפה טוב מאוד",
    };

    it("updates review for owner", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      const existingReview = {
        ...mockReview,
        id: validInput.reviewId,
        userId: mockUser.id,
        truckId: "truck-123",
      };

      mockPrisma.review.findUnique.mockResolvedValue(existingReview);
      mockPrisma.review.update.mockResolvedValue(existingReview);

      const result = await updateReview(validInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.review.update).toHaveBeenCalledWith({
        where: { id: validInput.reviewId },
        data: {
          rating: validInput.rating,
          content: validInput.content,
        },
      });
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await updateReview(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("אינך מחובר");
    });

    it("rejects when review not found", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);
      mockPrisma.review.findUnique.mockResolvedValue(null);

      const result = await updateReview(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("הביקורת לא נמצאה");
    });

    it("rejects non-owner from updating", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser, id: "other-user-id" },
        session: {
          id: "session-1",
          userId: "other-user-id",
          expiresAt: new Date(),
        },
      } as any);

      const existingReview = {
        ...mockReview,
        id: validInput.reviewId,
        userId: "original-user-id",
        truckId: "truck-123",
      };

      mockPrisma.review.findUnique.mockResolvedValue(existingReview);

      const result = await updateReview(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toContain("אינך מורשה");
    });

    it("validates input with Zod", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      const invalidInput = { ...validInput, rating: 0 };

      const result = await updateReview(invalidInput);

      expect(result.success).toBe(false);
      expect(mockPrisma.review.update).not.toHaveBeenCalled();
    });

    it("validates content length", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      const invalidInput = { ...validInput, content: "קצר" };

      const result = await updateReview(invalidInput);

      expect(result.success).toBe(false);
    });
  });

  describe("deleteReview", () => {
    const validInput = {
      reviewId: "review-123",
    };

    it("deletes review for owner", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      const existingReview = {
        ...mockReview,
        id: validInput.reviewId,
        userId: mockUser.id,
        truckId: "truck-123",
      };

      mockPrisma.review.findUnique.mockResolvedValue(existingReview);
      mockPrisma.review.delete.mockResolvedValue(undefined);

      const result = await deleteReview(validInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.review.delete).toHaveBeenCalledWith({
        where: { id: validInput.reviewId },
      });
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await deleteReview(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("אינך מחובר");
    });

    it("rejects when review not found", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);
      mockPrisma.review.findUnique.mockResolvedValue(null);

      const result = await deleteReview(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("הביקורת לא נמצאה");
    });

    it("rejects non-owner from deleting", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser, id: "other-user-id" },
        session: {
          id: "session-1",
          userId: "other-user-id",
          expiresAt: new Date(),
        },
      } as any);

      const existingReview = {
        ...mockReview,
        id: validInput.reviewId,
        userId: "original-user-id",
        truckId: "truck-123",
      };

      mockPrisma.review.findUnique.mockResolvedValue(existingReview);

      const result = await deleteReview(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toContain("אינך מורשה");
    });

    it("validates reviewId with Zod", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      const result = await deleteReview({ reviewId: "" });

      expect(result.success).toBe(false);
      expect(mockPrisma.review.delete).not.toHaveBeenCalled();
    });
  });
});
