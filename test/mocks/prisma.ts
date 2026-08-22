import { vi } from "vitest";

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
const mockImageCreateMany = vi.fn();
const mockImageUpdate = vi.fn();
const mockImageUpdateMany = vi.fn();
const mockImageDelete = vi.fn();

const mockUserFindUnique = vi.fn();
const mockUserUpdate = vi.fn();

const mockTruckHoursFindMany = vi.fn();
const mockTruckHoursDeleteMany = vi.fn();
const mockTruckHoursCreate = vi.fn();

const mockTransaction = vi.fn();

export const mockPrismaClient = {
  $disconnect: vi.fn(),
  $transaction: mockTransaction,
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
    createMany: mockImageCreateMany,
    update: mockImageUpdate,
    updateMany: mockImageUpdateMany,
    delete: mockImageDelete,
  },
  user: {
    findUnique: mockUserFindUnique,
    update: mockUserUpdate,
  },
  truckHours: {
    findMany: mockTruckHoursFindMany,
    deleteMany: mockTruckHoursDeleteMany,
    create: mockTruckHoursCreate,
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
  mockImageCreateMany.mockReset();
  mockImageUpdate.mockReset();
  mockImageUpdateMany.mockReset();
  mockImageDelete.mockReset();

  mockUserFindUnique.mockReset();
  mockUserUpdate.mockReset();

  mockTruckHoursFindMany.mockReset();
  mockTruckHoursDeleteMany.mockReset();
  mockTruckHoursCreate.mockReset();

  mockTransaction.mockReset();
  mockTransaction.mockImplementation(
    async (cb: (tx: unknown) => Promise<unknown>) => cb(mockPrismaClient),
  );
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrismaClient,
}));
