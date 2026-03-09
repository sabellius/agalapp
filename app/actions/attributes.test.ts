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
    truckAttribute: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    truckAttributeAssignment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      count: vi.fn(),
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
import { mockUser } from "@/test/fixtures/users";
import {
  addTruckAttribute,
  getTruckAssignedAttributes,
  getTruckAttributes,
  removeTruckAttribute,
  setTruckAttributes,
} from "./attributes";

const mockPrisma = prisma as typeof prisma & {
  user: { findUnique: ReturnType<typeof vi.fn> };
  coffeeTruck: { findUnique: ReturnType<typeof vi.fn> };
  truckAttribute: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
  };
  truckAttributeAssignment: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    createMany: ReturnType<typeof vi.fn>;
    count: (args: { where: { truckId: string } }) => Promise<number>;
  };
};

const mockAuth = auth as typeof auth & {
  api: { getSession: ReturnType<typeof vi.fn> };
};

describe("attributes server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTruckAttributes", () => {
    it("returns all active attributes", async () => {
      const mockAttributes = [
        {
          id: "attr-1",
          name: "נגיש",
          nameEn: "Accessible",
          icon: "accessibility",
        },
        { id: "attr-2", name: "WiFi", nameEn: "WiFi", icon: "wifi" },
      ];
      mockPrisma.truckAttribute.findMany.mockResolvedValue(mockAttributes);

      const result = await getTruckAttributes();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAttributes);
      expect(mockPrisma.truckAttribute.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          nameEn: true,
          icon: true,
        },
      });
    });

    it("handles database error", async () => {
      mockPrisma.truckAttribute.findMany.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await getTruckAttributes();

      expect(result.success).toBe(false);
      expect(result.message).toBe("שגיאה בטעינת המאפיינים");
    });
  });

  describe("getTruckAssignedAttributes", () => {
    it("returns assigned attributes for a truck", async () => {
      const mockAssignments = [
        {
          id: "assign-1",
          attribute: {
            id: "attr-1",
            name: "נגיש",
            nameEn: "Accessible",
            icon: "accessibility",
          },
        },
        {
          id: "assign-2",
          attribute: {
            id: "attr-2",
            name: "WiFi",
            nameEn: "WiFi",
            icon: "wifi",
          },
        },
      ];
      mockPrisma.truckAttributeAssignment.findMany.mockResolvedValue(
        mockAssignments,
      );

      const result = await getTruckAssignedAttributes("truck-123");

      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        {
          id: "attr-1",
          name: "נגיש",
          nameEn: "Accessible",
          icon: "accessibility",
          assignedId: "assign-1",
        },
        {
          id: "attr-2",
          name: "WiFi",
          nameEn: "WiFi",
          icon: "wifi",
          assignedId: "assign-2",
        },
      ]);
    });

    it("handles database error", async () => {
      mockPrisma.truckAttributeAssignment.findMany.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await getTruckAssignedAttributes("truck-123");

      expect(result.success).toBe(false);
      expect(result.message).toBe("שגיאה בטעינת המאפיינים");
    });
  });

  describe("setTruckAttributes", () => {
    const validInput = {
      truckId: "truck-123",
      attributeIds: ["attr-1", "attr-2"],
    };

    it("sets attributes for authenticated owner", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser, tier: "FREE", tierExpiryAt: null },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        tier: "FREE",
        tierExpiryAt: null,
      });

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockUser.id,
      });

      mockPrisma.truckAttribute.findMany.mockResolvedValue([
        { id: "attr-1" },
        { id: "attr-2" },
      ]);

      mockPrisma.truckAttributeAssignment.deleteMany.mockResolvedValue({
        count: 2,
      });
      mockPrisma.truckAttributeAssignment.createMany.mockResolvedValue(
        undefined,
      );

      const result = await setTruckAttributes(validInput);

      expect(result.success).toBe(true);
      expect(
        mockPrisma.truckAttributeAssignment.deleteMany,
      ).toHaveBeenCalledWith({
        where: { truckId: validInput.truckId },
      });
      expect(
        mockPrisma.truckAttributeAssignment.createMany,
      ).toHaveBeenCalledWith({
        data: [
          { truckId: validInput.truckId, attributeId: "attr-1" },
          { truckId: validInput.truckId, attributeId: "attr-2" },
        ],
      });
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await setTruckAttributes(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("אינך מחובר");
    });

    it("rejects non-owner", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        tier: "FREE",
        tierExpiryAt: null,
      });

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: "other-user-id",
      });

      const result = await setTruckAttributes(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("אינך מורשה לערוך עגלה זו");
    });

    it("enforces tier limits for free users", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser, tier: "FREE", tierExpiryAt: null },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        tier: "FREE",
        tierExpiryAt: null,
      });

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockUser.id,
      });

      const result = await setTruckAttributes({
        truckId: "truck-123",
        attributeIds: ["attr-1", "attr-2", "attr-3", "attr-4"],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("מוגבל ל-3 מאפיינים בחינמי");
    });

    it("allows unlimited for premium users", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: {
          ...mockUser,
          tier: "PREMIUM",
          tierExpiryAt: new Date(Date.now() + 86400000),
        },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        tier: "PREMIUM",
        tierExpiryAt: new Date(Date.now() + 86400000),
      });

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockUser.id,
      });

      mockPrisma.truckAttribute.findMany.mockResolvedValue([
        { id: "attr-1" },
        { id: "attr-2" },
        { id: "attr-3" },
        { id: "attr-4" },
      ]);

      mockPrisma.truckAttributeAssignment.deleteMany.mockResolvedValue({
        count: 2,
      });
      mockPrisma.truckAttributeAssignment.createMany.mockResolvedValue(
        undefined,
      );

      const result = await setTruckAttributes({
        truckId: "truck-123",
        attributeIds: ["attr-1", "attr-2", "attr-3", "attr-4"],
      });

      expect(result.success).toBe(true);
    });
  });

  describe("addTruckAttribute", () => {
    const validInput = {
      truckId: "truck-123",
      attributeId: "attr-1",
    };

    it("adds attribute for authenticated owner", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        tier: "FREE",
        tierExpiryAt: null,
      });

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockUser.id,
      });

      mockPrisma.truckAttributeAssignment.count.mockResolvedValue(0);
      mockPrisma.truckAttribute.findFirst.mockResolvedValue({
        id: "attr-1",
        isActive: true,
      });
      mockPrisma.truckAttributeAssignment.findUnique.mockResolvedValue(null);
      mockPrisma.truckAttributeAssignment.create.mockResolvedValue(undefined);

      const result = await addTruckAttribute(validInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.truckAttributeAssignment.create).toHaveBeenCalledWith({
        data: {
          truckId: validInput.truckId,
          attributeId: validInput.attributeId,
        },
      });
    });

    it("enforces tier limits", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser, tier: "FREE", tierExpiryAt: null },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        tier: "FREE",
        tierExpiryAt: null,
      });

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockUser.id,
      });

      mockPrisma.truckAttributeAssignment.count.mockResolvedValue(3);

      const result = await addTruckAttribute(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toContain("מוגבל ל-3 מאפיינים בחינמי");
    });

    it("rejects if attribute already assigned", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        tier: "FREE",
        tierExpiryAt: null,
      });

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockUser.id,
      });

      mockPrisma.truckAttributeAssignment.count.mockResolvedValue(1);
      mockPrisma.truckAttribute.findFirst.mockResolvedValue({
        id: "attr-1",
        isActive: true,
      });
      mockPrisma.truckAttributeAssignment.findUnique.mockResolvedValue({
        id: "existing-assignment",
      });

      const result = await addTruckAttribute(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toBe("המאפיין כבר משויך לעגלה זו");
    });
  });

  describe("removeTruckAttribute", () => {
    const validInput = {
      truckId: "truck-123",
      attributeId: "attr-1",
    };

    it("removes attribute for authenticated owner", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockUser.id,
      });

      mockPrisma.truckAttributeAssignment.delete.mockResolvedValue(undefined);

      const result = await removeTruckAttribute(validInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.truckAttributeAssignment.delete).toHaveBeenCalledWith({
        where: {
          truckId_attributeId: {
            truckId: validInput.truckId,
            attributeId: validInput.attributeId,
          },
        },
      });
    });

    it("rejects non-owner", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: "other-user-id",
      });

      const result = await removeTruckAttribute(validInput);

      expect(result.success).toBe(false);
      expect(result.message).toContain("אינך מורשה");
    });
  });
});
