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
    coffeeTruckImage: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/cloudinary", () => ({
  default: {
    uploader: {
      destroy: vi.fn(),
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
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { mockAdmin, mockTruckOwner, mockUser } from "@/test/fixtures/users";
import { deleteImage, setPrimaryImage, updateImageAlt } from "./images";

const mockPrisma = prisma as typeof prisma & {
  user: { findUnique: ReturnType<typeof vi.fn> };
  coffeeTruck: { findUnique: ReturnType<typeof vi.fn> };
  coffeeTruckImage: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

const mockAuth = auth as typeof auth & {
  api: { getSession: ReturnType<typeof vi.fn> };
};

const mockCloudinary = cloudinary as typeof cloudinary & {
  uploader: { destroy: ReturnType<typeof vi.fn> };
};

describe("images server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCloudinary.uploader.destroy.mockResolvedValue({ result: "ok" });
  });

  describe("deleteImage", () => {
    const validInput = {
      imageId: "img-123",
      truckId: "truck-123",
    };

    it("deletes image for owner", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      const image = {
        id: validInput.imageId,
        publicId: "cloudinary-123",
        isPrimary: false,
        truck: { ownerId: mockTruckOwner.id },
      };

      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue(image);
      mockPrisma.coffeeTruckImage.findMany.mockResolvedValue([image]);
      mockPrisma.coffeeTruckImage.delete.mockResolvedValue(undefined);

      const result = await deleteImage(validInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.coffeeTruckImage.delete).toHaveBeenCalledWith({
        where: { id: validInput.imageId },
      });
      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith(
        "cloudinary-123",
      );
    });

    it("deletes image for admin", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockAdmin },
        session: {
          id: "session-1",
          userId: mockAdmin.id,
          expiresAt: new Date(),
        },
      } as any);

      const image = {
        id: validInput.imageId,
        publicId: "cloudinary-123",
        isPrimary: false,
        truck: { ownerId: "other-owner-id" },
      };

      mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN" });
      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue(image);
      mockPrisma.coffeeTruckImage.findMany.mockResolvedValue([image]);
      mockPrisma.coffeeTruckImage.delete.mockResolvedValue(undefined);

      const result = await deleteImage(validInput);

      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await deleteImage(validInput);

      if (!result.success) {
        expect(result.message).toBe("אינך מחובר");
      }
    });

    it("rejects when image not found", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);
      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue(null);

      const result = await deleteImage(validInput);

      if (!result.success) {
        expect(result.message).toBe("התמונה לא נמצאה");
      }
    });

    it("rejects non-owner from deleting", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      const image = {
        id: validInput.imageId,
        publicId: "cloudinary-123",
        isPrimary: false,
        truck: { ownerId: "other-owner-id" },
      };

      mockPrisma.user.findUnique.mockResolvedValue({ role: "USER" });
      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue(image);

      const result = await deleteImage(validInput);

      if (!result.success) {
        expect(result.message).toContain("אינך מורשה");
      }
    });

    it("sets next image as primary when deleting primary image", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      const primaryImage = {
        id: validInput.imageId,
        publicId: "cloudinary-123",
        isPrimary: true,
        truck: { ownerId: mockTruckOwner.id },
      };

      const nextImage = {
        id: "img-456",
        isPrimary: false,
      };

      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue(primaryImage);
      mockPrisma.coffeeTruckImage.findMany.mockResolvedValue([
        primaryImage,
        nextImage,
      ]);
      mockPrisma.coffeeTruckImage.delete.mockResolvedValue(undefined);
      mockPrisma.coffeeTruckImage.update.mockResolvedValue(undefined);

      const result = await deleteImage(validInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.coffeeTruckImage.update).toHaveBeenCalledWith({
        where: { id: "img-456" },
        data: { isPrimary: true },
      });
    });

    it("handles Cloudinary deletion error gracefully", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      const image = {
        id: validInput.imageId,
        publicId: "cloudinary-123",
        isPrimary: false,
        truck: { ownerId: mockTruckOwner.id },
      };

      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue(image);
      mockPrisma.coffeeTruckImage.findMany.mockResolvedValue([image]);
      mockCloudinary.uploader.destroy.mockRejectedValue(
        new Error("Cloudinary error"),
      );
      mockPrisma.coffeeTruckImage.delete.mockResolvedValue(undefined);

      const result = await deleteImage(validInput);

      expect(result.success).toBe(true);
    });

    it("validates input with Zod", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      const result = await deleteImage({ imageId: "", truckId: "truck-123" });

      expect(result.success).toBe(false);
      expect(mockPrisma.coffeeTruckImage.delete).not.toHaveBeenCalled();
    });
  });

  describe("setPrimaryImage", () => {
    const validInput = {
      imageId: "img-123",
      truckId: "truck-123",
    };

    it("sets primary image for owner", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockTruckOwner.id,
      });
      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue({
        truckId: validInput.truckId,
      });
      mockPrisma.coffeeTruckImage.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.coffeeTruckImage.update.mockResolvedValue(undefined);

      const result = await setPrimaryImage(validInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.coffeeTruckImage.updateMany).toHaveBeenCalledWith({
        where: { truckId: validInput.truckId },
        data: { isPrimary: false },
      });
      expect(mockPrisma.coffeeTruckImage.update).toHaveBeenCalledWith({
        where: { id: validInput.imageId },
        data: { isPrimary: true },
      });
    });

    it("sets primary image for admin", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockAdmin },
        session: {
          id: "session-1",
          userId: mockAdmin.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN" });
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: "other-owner-id",
      });
      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue({
        truckId: validInput.truckId,
      });
      mockPrisma.coffeeTruckImage.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.coffeeTruckImage.update.mockResolvedValue(undefined);

      const result = await setPrimaryImage(validInput);

      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await setPrimaryImage(validInput);

      if (!result.success) {
        expect(result.message).toBe("אינך מחובר");
      }
    });

    it("rejects when truck not found", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue(null);

      const result = await setPrimaryImage(validInput);

      if (!result.success) {
        expect(result.message).toBe("העגלה לא נמצאה");
      }
    });

    it("rejects non-owner from setting primary", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.user.findUnique.mockResolvedValue({ role: "USER" });
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: "other-owner-id",
      });

      const result = await setPrimaryImage(validInput);

      if (!result.success) {
        expect(result.message).toContain("אינך מורשה");
      }
    });

    it("rejects when image does not belong to truck", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockTruckOwner.id,
      });
      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue({
        truckId: "other-truck-id",
      });

      const result = await setPrimaryImage(validInput);

      if (!result.success) {
        expect(result.message).toContain("לא שייכת לעגלה זו");
      }
    });

    it("validates input with Zod", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      const result = await setPrimaryImage({ imageId: "", truckId: "" });

      expect(result.success).toBe(false);
    });
  });

  describe("updateImageAlt", () => {
    const validInput = {
      imageId: "img-123",
      alt: "תמונה של עגלת קפה",
    };

    it("updates alt text for owner", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      const image = {
        id: validInput.imageId,
        truckId: "truck-123",
        truck: { ownerId: mockTruckOwner.id },
      };

      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue(image);
      mockPrisma.coffeeTruckImage.update.mockResolvedValue(undefined);

      const result = await updateImageAlt(validInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.coffeeTruckImage.update).toHaveBeenCalledWith({
        where: { id: validInput.imageId },
        data: { alt: validInput.alt },
      });
    });

    it("updates alt text for admin", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockAdmin },
        session: {
          id: "session-1",
          userId: mockAdmin.id,
          expiresAt: new Date(),
        },
      } as any);

      const image = {
        id: validInput.imageId,
        truckId: "truck-123",
        truck: { ownerId: "other-owner-id" },
      };

      mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN" });
      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue(image);
      mockPrisma.coffeeTruckImage.update.mockResolvedValue(undefined);

      const result = await updateImageAlt(validInput);

      expect(result.success).toBe(true);
    });

    it("allows empty alt text", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      const image = {
        id: validInput.imageId,
        truckId: "truck-123",
        truck: { ownerId: mockTruckOwner.id },
      };

      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue(image);
      mockPrisma.coffeeTruckImage.update.mockResolvedValue(undefined);

      const result = await updateImageAlt({ ...validInput, alt: "" });

      expect(result.success).toBe(true);
    });

    it("rejects unauthenticated user", async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await updateImageAlt(validInput);

      if (!result.success) {
        expect(result.message).toBe("אינך מחובר");
      }
    });

    it("rejects when image not found", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);
      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue(null);

      const result = await updateImageAlt(validInput);

      if (!result.success) {
        expect(result.message).toBe("התמונה לא נמצאה");
      }
    });

    it("rejects non-owner from updating", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockUser },
        session: {
          id: "session-1",
          userId: mockUser.id,
          expiresAt: new Date(),
        },
      } as any);

      const image = {
        id: validInput.imageId,
        truckId: "truck-123",
        truck: { ownerId: "other-owner-id" },
      };

      mockPrisma.user.findUnique.mockResolvedValue({ role: "USER" });
      mockPrisma.coffeeTruckImage.findUnique.mockResolvedValue(image);

      const result = await updateImageAlt(validInput);

      if (!result.success) {
        expect(result.message).toContain("אינך מורשה");
      }
    });

    it("validates alt text length", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      const result = await updateImageAlt({
        ...validInput,
        alt: "א".repeat(201),
      });

      expect(result.success).toBe(false);
    });

    it("validates input with Zod", async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { ...mockTruckOwner },
        session: {
          id: "session-1",
          userId: mockTruckOwner.id,
          expiresAt: new Date(),
        },
      } as any);

      const result = await updateImageAlt({ imageId: "", alt: "תמונה" });

      expect(result.success).toBe(false);
    });
  });
});
