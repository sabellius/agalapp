import { vi } from "vitest";
import type {
  CoffeeTruck,
  CoffeeTruckImage,
  Review,
  User,
} from "@/generated/prisma/client";

const mockTruckFindMany = vi.fn();
const mockTruckFindUnique = vi.fn();
const mockTruckCreate = vi.fn();
const mockTruckUpdate = vi.fn();
const mockTruckDelete = vi.fn();

const mockReviewFindMany = vi.fn();
const mockReviewFindUnique = vi.fn();
const mockReviewCreate = vi.fn();
const mockReviewUpdate = vi.fn();
const mockReviewDelete = vi.fn();

const mockImageFindMany = vi.fn();
const mockImageFindUnique = vi.fn();
const mockImageCreate = vi.fn();
const mockImageUpdate = vi.fn();
const mockImageDelete = vi.fn();

const mockUserFindUnique = vi.fn();
const mockUserUpdate = vi.fn();

export const mockPrismaClient = {
  $disconnect: vi.fn(),
  coffeeTruck: {
    findMany: mockTruckFindMany,
    findUnique: mockTruckFindUnique,
    create: mockTruckCreate,
    update: mockTruckUpdate,
    delete: mockTruckDelete,
  },
  review: {
    findMany: mockReviewFindMany,
    findUnique: mockReviewFindUnique,
    create: mockReviewCreate,
    update: mockReviewUpdate,
    delete: mockReviewDelete,
  },
  coffeeTruckImage: {
    findMany: mockImageFindMany,
    findUnique: mockImageFindUnique,
    create: mockImageCreate,
    update: mockImageUpdate,
    delete: mockImageDelete,
  },
  user: {
    findUnique: mockUserFindUnique,
    update: mockUserUpdate,
  },
};

export const mockReset = () => {
  mockTruckFindMany.mockReset();
  mockTruckFindUnique.mockReset();
  mockTruckCreate.mockReset();
  mockTruckUpdate.mockReset();
  mockTruckDelete.mockReset();

  mockReviewFindMany.mockReset();
  mockReviewFindUnique.mockReset();
  mockReviewCreate.mockReset();
  mockReviewUpdate.mockReset();
  mockReviewDelete.mockReset();

  mockImageFindMany.mockReset();
  mockImageFindUnique.mockReset();
  mockImageCreate.mockReset();
  mockImageUpdate.mockReset();
  mockImageDelete.mockReset();

  mockUserFindUnique.mockReset();
  mockUserUpdate.mockReset();
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrismaClient,
}));
