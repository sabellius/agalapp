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
      update: vi.fn(),
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
import { mockTruckOwner } from "@/test/fixtures/users";
import { downgradeAccount, upgradeAccount } from "./subscription";

const mockPrisma = prisma as typeof prisma & {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

const mockAuth = auth as typeof auth & {
  api: { getSession: ReturnType<typeof vi.fn> };
};

describe("subscription server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("upgradeAccount", () => {
    it("upgrades user to premium for 30 days", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        tier: "FREE",
      });

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      mockPrisma.user.update.mockResolvedValue({
        id: mockTruckOwner.id,
        tier: "PREMIUM",
        tierExpiryAt: expiryDate,
      });

      const result = await upgradeAccount();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.expiryDate).toBeDefined();
      }
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockTruckOwner.id },
        data: {
          tier: "PREMIUM",
          tierExpiryAt: expect.any(Date),
        },
      });
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await upgradeAccount();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("אינך מחובר");
      }
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it("handles user not found gracefully", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await upgradeAccount();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("משתמש לא נמצא");
      }
    });
  });

  describe("downgradeAccount", () => {
    it("downgrades user from premium to free", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.update.mockResolvedValue({
        id: mockTruckOwner.id,
        tier: "FREE",
        tierExpiryAt: null,
      });

      const result = await downgradeAccount();

      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockTruckOwner.id },
        data: {
          tier: "FREE",
          tierExpiryAt: null,
        },
      });
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await downgradeAccount();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("אינך מחובר");
      }
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });
});
