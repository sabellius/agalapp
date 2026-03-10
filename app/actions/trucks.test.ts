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
    coffeeTruck: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    coffeeTruckImage: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
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
import type {
  CreateTruckInput,
  DeleteTruckInput,
  UpdateTruckInput,
} from "@/lib/validations";
import { mockTruck } from "@/test/fixtures/trucks";
import { mockAdmin, mockTruckOwner, mockUser } from "@/test/fixtures/users";
import { mockAuthSession } from "@/test/utils/test-helpers";
import { createTruck, deleteTruck, updateTruck } from "./trucks";

const mockPrisma = prisma as typeof prisma & {
  user: { findUnique: ReturnType<typeof vi.fn> };
  coffeeTruck: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  coffeeTruckImage: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    createMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

const mockAuth = auth as typeof auth & {
  api: { getSession: ReturnType<typeof vi.fn> };
};

describe("trucks server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTruck", () => {
    const validInput: CreateTruckInput = {
      name: "עגלת קפה מעולה",
      city: "תל אביב",
      address: "רוטשילד 1",
      images: [
        {
          url: "https://example.com/image.jpg",
          publicId: "img_123",
          alt: "תמונה",
          isPrimary: true,
        },
      ],
    };

    it("creates truck for truck owner", async () => {
      mockAuthSession(mockTruckOwner);
      mockPrisma.user.findUnique.mockResolvedValue({
        role: mockTruckOwner.role,
      });
      mockPrisma.coffeeTruck.create.mockResolvedValue({
        ...mockTruck,
        id: "new-truck-id",
      });

      const result = await createTruck(validInput);

      if (result.success) {
        expect(result.data).toBeDefined();
      }
      expect(mockPrisma.coffeeTruck.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: validInput.name,
          city: validInput.city,
          address: validInput.address,
          ownerId: mockTruckOwner.id,
        }),
      });
    });

    it("creates truck for admin", async () => {
      mockAuthSession(mockAdmin);
      mockPrisma.user.findUnique.mockResolvedValue({
        role: mockAdmin.role,
      });
      mockPrisma.coffeeTruck.create.mockResolvedValue({
        ...mockTruck,
        id: "new-truck-id",
      });

      const result = await createTruck(validInput);

      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await createTruck(validInput);

      if (!result.success) {
        expect(result.message).toBe("אינך מחובר");
      }
      expect(mockPrisma.coffeeTruck.create).not.toHaveBeenCalled();
    });

    it("rejects regular user (not truck owner or admin)", async () => {
      mockAuthSession(mockUser);
      mockPrisma.user.findUnique.mockResolvedValue({
        role: mockUser.role,
      });

      const result = await createTruck(validInput);

      if (!result.success) {
        expect(result.message).toContain("רק בעלי עגלות");
      }
    });

    it("validates input with Zod", async () => {
      mockAuthSession(mockTruckOwner);
      mockPrisma.user.findUnique.mockResolvedValue({
        role: mockTruckOwner.role,
      });

      const invalidInput = { ...validInput, name: "" };

      const result = await createTruck(invalidInput);

      expect(result.success).toBe(false);
      expect(mockPrisma.coffeeTruck.create).not.toHaveBeenCalled();
    });
  });

  describe("updateTruck", () => {
    const validInput: UpdateTruckInput & { truckId: string } = {
      truckId: "truck-123",
      name: "עגלת קפה מעודכנת",
      city: "תל אביב",
      address: "רוטשילד 2",
      images: [
        {
          id: "existing-img-1",
          url: "https://example.com/image.jpg",
          publicId: "img_123",
          alt: "תמונה",
          isPrimary: true,
        },
      ],
    };

    it("updates truck for owner", async () => {
      mockAuthSession(mockTruckOwner);

      const truck = {
        ...mockTruck,
        id: validInput.truckId,
        ownerId: mockTruckOwner.id,
        images: [{ id: "img-1", publicId: "img_123" }],
      };

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue(truck);
      mockPrisma.coffeeTruckImage.delete.mockResolvedValue(undefined);
      mockPrisma.coffeeTruckImage.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.coffeeTruck.update.mockResolvedValue(truck);

      const result = await updateTruck(validInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.coffeeTruck.update).toHaveBeenCalled();
    });

    it("updates truck for admin", async () => {
      mockAuthSession(mockAdmin);

      const truck = {
        ...mockTruck,
        id: validInput.truckId,
        ownerId: "other-owner-id",
        images: [{ id: "img-1", publicId: "img_123" }],
      };

      mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN" });
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue(truck);
      mockPrisma.coffeeTruckImage.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.coffeeTruck.update.mockResolvedValue(truck);

      const result = await updateTruck(validInput);

      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await updateTruck(validInput);

      if (!result.success) {
        expect(result.message).toBe("אינך מחובר");
      }
    });

    it("rejects when truck not found", async () => {
      mockAuthSession(mockTruckOwner);

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue(null);

      const result = await updateTruck(validInput);

      if (!result.success) {
        expect(result.message).toBe("העגלה לא נמצאה");
      }
    });

    it("rejects non-owner from updating", async () => {
      mockAuthSession(mockUser);

      const truck = {
        ...mockTruck,
        id: validInput.truckId,
        ownerId: "other-owner-id",
        images: [{ id: "img-1", publicId: "img_123" }],
      };

      mockPrisma.user.findUnique.mockResolvedValue({ role: "USER" });
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue(truck);

      const result = await updateTruck(validInput);

      if (!result.success) {
        expect(result.message).toContain("אינך מורשה");
      }
    });
  });

  describe("deleteTruck", () => {
    const validInput: DeleteTruckInput = {
      truckId: "truck-123",
    };

    it("deletes truck for owner", async () => {
      mockAuthSession(mockTruckOwner);

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockTruckOwner.id,
      });
      mockPrisma.coffeeTruck.delete.mockResolvedValue(undefined);

      const result = await deleteTruck(validInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.coffeeTruck.delete).toHaveBeenCalledWith({
        where: { id: validInput.truckId },
      });
    });

    it("deletes truck for admin", async () => {
      mockAuthSession(mockAdmin);

      mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN" });
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: "other-owner-id",
      });
      mockPrisma.coffeeTruck.delete.mockResolvedValue(undefined);

      const result = await deleteTruck(validInput);

      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await deleteTruck(validInput);

      if (!result.success) {
        expect(result.message).toBe("אינך מחובר");
      }
    });

    it("rejects when truck not found", async () => {
      mockAuthSession(mockTruckOwner);

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue(null);

      const result = await deleteTruck(validInput);

      if (!result.success) {
        expect(result.message).toBe("העגלה לא נמצאה");
      }
    });

    it("rejects non-owner from deleting", async () => {
      mockAuthSession(mockUser);

      mockPrisma.user.findUnique.mockResolvedValue({ role: "USER" });
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: "other-owner-id",
      });

      const result = await deleteTruck(validInput);

      if (!result.success) {
        expect(result.message).toContain("אינך מורשה");
      }
    });

    it("validates truckId with Zod", async () => {
      mockAuthSession(mockTruckOwner);

      const result = await deleteTruck({ truckId: "" });

      expect(result.success).toBe(false);
      expect(mockPrisma.coffeeTruck.delete).not.toHaveBeenCalled();
    });
  });
});
