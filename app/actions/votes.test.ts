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
    review: {
      findUnique: vi.fn(),
    },
    vote: {
      create: vi.fn(),
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
import { mockAuthSession } from "@/test/utils/test-helpers";
import { toggleVote } from "./votes";

const mockPrisma = prisma as typeof prisma & {
  review: { findUnique: ReturnType<typeof vi.fn> };
  vote: {
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

const mockAuth = auth as typeof auth & {
  api: { getSession: ReturnType<typeof vi.fn> };
};

describe("votes server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("toggleVote", () => {
    const validInput = {
      reviewId: "review-123",
    };

    it("creates vote for authenticated user", async () => {
      mockAuthSession(mockUser);

      mockPrisma.review.findUnique.mockResolvedValue({
        ...mockReview,
        id: validInput.reviewId,
        truckId: "truck-123",
        userId: "other-user-id",
        votes: [],
        _count: { votes: 0 },
      });

      mockPrisma.vote.create.mockResolvedValue({
        id: "vote-123",
        reviewId: validInput.reviewId,
        userId: mockUser.id,
      });

      const result = await toggleVote(validInput);

      if (result.success) {
        expect(result.data).toEqual({ voted: true, voteCount: 1 });
      }
    });

    it("removes existing vote on toggle", async () => {
      mockAuthSession(mockUser);

      mockPrisma.review.findUnique.mockResolvedValue({
        ...mockReview,
        id: validInput.reviewId,
        truckId: "truck-123",
        userId: "other-user-id",
        votes: [{ id: "vote-123", userId: mockUser.id }],
        _count: { votes: 1 },
      });

      mockPrisma.vote.delete.mockResolvedValue(undefined);

      const result = await toggleVote(validInput);

      if (result.success) {
        expect(result.data).toEqual({ voted: false, voteCount: 0 });
      }
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await toggleVote(validInput);

      if (!result.success) {
        expect(result.message).toBe("אינך מחובר");
      }
    });

    it("rejects voting on own review", async () => {
      mockAuthSession(mockUser);

      mockPrisma.review.findUnique.mockResolvedValue({
        ...mockReview,
        id: validInput.reviewId,
        truckId: "truck-123",
        userId: mockUser.id,
        votes: [],
        _count: { votes: 0 },
      });

      const result = await toggleVote(validInput);

      if (!result.success) {
        expect(result.message).toBe("אינך יכול להצביע על הביקורת שלך");
      }
    });

    it("rejects when review not found", async () => {
      mockAuthSession(mockUser);

      mockPrisma.review.findUnique.mockResolvedValue(null);

      const result = await toggleVote(validInput);

      if (!result.success) {
        expect(result.message).toBe("הביקורת לא נמצאה");
      }
    });

    it("validates reviewId with Zod", async () => {
      mockAuthSession(mockUser);

      const result = await toggleVote({ reviewId: "" });

      if (!result.success) {
        expect(result.message).toBe("מזהה ביקורת חסר");
      }
    });
  });
});
