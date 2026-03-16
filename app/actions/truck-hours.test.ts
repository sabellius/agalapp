vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import type { TruckHours } from "@/generated/prisma/client";
import type { WeeklyHoursInput } from "@/lib/validations/truck-hours-schema";
import { mockPremiumUser, mockTruckOwner } from "@/test/fixtures/users";
import { mockPrismaClient, mockReset } from "@/test/mocks/prisma";
import { mockAuthSession } from "@/test/utils/test-helpers";
import {
  checkIsOpenNow,
  clearTruckHours,
  getTruckHours,
  setTruckHours,
} from "./truck-hours";

const mockPrisma = mockPrismaClient as typeof mockPrismaClient & {
  user: { findUnique: ReturnType<typeof import("vitest").vi.fn> };
  coffeeTruck: { findUnique: ReturnType<typeof import("vitest").vi.fn> };
  truckHours: {
    findMany: ReturnType<typeof import("vitest").vi.fn>;
    deleteMany: ReturnType<typeof import("vitest").vi.fn>;
    create: ReturnType<typeof import("vitest").vi.fn>;
  };
};

describe("truck-hours server actions", () => {
  beforeEach(() => {
    mockReset();
    vi.clearAllMocks();
  });

  describe("getTruckHours", () => {
    const mockTruckHours: TruckHours[] = [
      {
        id: "hours-1",
        truckId: "clh7xv2k90000000",
        dayOfWeek: 0,
        openTime: "09:00",
        closeTime: "17:00",
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "hours-2",
        truckId: "clh7xv2k90000000",
        dayOfWeek: 1,
        openTime: "09:00",
        closeTime: "17:00",
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it("returns truck hours when found", async () => {
      mockPrisma.truckHours.findMany.mockResolvedValue(mockTruckHours);

      const result = await getTruckHours("clh7xv2k90000000");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockTruckHours);
      }
      expect(mockPrisma.truckHours.findMany).toHaveBeenCalledWith({
        where: { truckId: "clh7xv2k90000000" },
        orderBy: { dayOfWeek: "asc" },
      });
    });

    it("returns blank hours array when none exist", async () => {
      mockPrisma.truckHours.findMany.mockResolvedValue([]);

      const result = await getTruckHours("clh7xv2k90000000");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(7);
        expect(result.data?.every((h: TruckHours) => h.isClosed === true)).toBe(
          true,
        );
      }
    });

    it("handles database errors", async () => {
      mockPrisma.truckHours.findMany.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await getTruckHours("clh7xv2k90000000");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("שגיאה בטעינת שעות הפעילות");
      }
    });
  });

  describe("setTruckHours", () => {
    const validInput: WeeklyHoursInput = {
      truckId: "clh7xv2k90000000",
      hours: [
        {
          dayOfWeek: 0,
          openTime: "09:00",
          closeTime: "17:00",
          isClosed: false,
        },
        {
          dayOfWeek: 1,
          openTime: "09:00",
          closeTime: "17:00",
          isClosed: false,
        },
        {
          dayOfWeek: 2,
          openTime: "09:00",
          closeTime: "17:00",
          isClosed: false,
        },
        {
          dayOfWeek: 3,
          openTime: "09:00",
          closeTime: "17:00",
          isClosed: false,
        },
        {
          dayOfWeek: 4,
          openTime: "09:00",
          closeTime: "17:00",
          isClosed: false,
        },
        { dayOfWeek: 5, openTime: null, closeTime: null, isClosed: true },
        { dayOfWeek: 6, openTime: null, closeTime: null, isClosed: true },
      ],
    };

    it("sets hours for premium truck owner", async () => {
      mockAuthSession(mockPremiumUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockPremiumUser);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockPremiumUser.id,
      });
      mockPrisma.truckHours.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.truckHours.create.mockResolvedValue({ id: "hours-1" });

      const result = await setTruckHours(validInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.truckHours.deleteMany).toHaveBeenCalledWith({
        where: { truckId: "clh7xv2k90000000" },
      });
      // Creates 5 open days + 2 closed days = 7 total
      expect(mockPrisma.truckHours.create).toHaveBeenCalledTimes(7);
    });

    it("rejects unauthenticated users", async () => {
      mockAuthSession(null);

      const result = await setTruckHours(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("אינך מחובר");
      }
      expect(mockPrisma.truckHours.deleteMany).not.toHaveBeenCalled();
    });

    it("rejects free tier users", async () => {
      mockAuthSession(mockTruckOwner);
      mockPrisma.user.findUnique.mockResolvedValue(mockTruckOwner);

      const result = await setTruckHours(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("שעות פעילות זמינות למנוי פרימיום");
      }
      expect(mockPrisma.truckHours.deleteMany).not.toHaveBeenCalled();
    });

    it("rejects non-owners", async () => {
      const otherUser = { ...mockPremiumUser, id: "other-user" };
      mockAuthSession(otherUser);
      mockPrisma.user.findUnique.mockResolvedValue(otherUser);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockPremiumUser.id, // Different owner
      });

      const result = await setTruckHours(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("אינך מורשה לערוך עגלה זו");
      }
    });

    it("returns error when truck not found", async () => {
      mockAuthSession(mockPremiumUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockPremiumUser);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue(null);

      const result = await setTruckHours(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("העגלה לא נמצאה");
      }
    });

    it("validates time format - rejects invalid format", async () => {
      mockAuthSession(mockPremiumUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockPremiumUser);

      const invalidInput = {
        ...validInput,
        hours: [
          {
            dayOfWeek: 0,
            openTime: "invalid",
            closeTime: "17:00",
            isClosed: false,
          },
          // ... rest would fail zod validation
        ],
      };

      const result = await setTruckHours(invalidInput);

      expect(result.success).toBe(false);
    });

    it("stores closed days correctly", async () => {
      const closedDayInput: WeeklyHoursInput = {
        truckId: "clh7xv2k90000000",
        hours: Array(7)
          .fill(null)
          .map((_, i) => ({
            dayOfWeek: i as 0 | 1 | 2 | 3 | 4 | 5 | 6,
            openTime: null,
            closeTime: null,
            isClosed: true,
          })),
      };

      mockAuthSession(mockPremiumUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockPremiumUser);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockPremiumUser.id,
      });
      mockPrisma.truckHours.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.truckHours.create.mockResolvedValue({ id: "hours-1" });

      const result = await setTruckHours(closedDayInput);

      expect(result.success).toBe(true);
      expect(mockPrisma.truckHours.create).toHaveBeenCalledTimes(7);
    });

    it("calls revalidatePath for truck and dashboard", async () => {
      const { revalidatePath } = await import("next/cache");

      mockAuthSession(mockPremiumUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockPremiumUser);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockPremiumUser.id,
      });
      mockPrisma.truckHours.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.truckHours.create.mockResolvedValue({ id: "hours-1" });

      await setTruckHours(validInput);

      expect(revalidatePath).toHaveBeenCalledWith("/trucks/clh7xv2k90000000");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("handles database errors gracefully", async () => {
      mockAuthSession(mockPremiumUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockPremiumUser);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockPremiumUser.id,
      });
      mockPrisma.truckHours.deleteMany.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await setTruckHours(validInput);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("שגיאה בשמירת שעות הפעילות");
      }
    });
  });

  describe("clearTruckHours", () => {
    it("clears hours for truck owner", async () => {
      mockAuthSession(mockTruckOwner);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockTruckOwner.id,
      });
      mockPrisma.truckHours.deleteMany.mockResolvedValue({ count: 5 });

      const result = await clearTruckHours("clh7xv2k90000000");

      expect(result.success).toBe(true);
      expect(mockPrisma.truckHours.deleteMany).toHaveBeenCalledWith({
        where: { truckId: "clh7xv2k90000000" },
      });
    });

    it("rejects unauthenticated users", async () => {
      mockAuthSession(null);

      const result = await clearTruckHours("clh7xv2k90000000");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("אינך מחובר");
      }
      expect(mockPrisma.truckHours.deleteMany).not.toHaveBeenCalled();
    });

    it("rejects non-owners", async () => {
      const otherUser = { ...mockTruckOwner, id: "other-user" };
      mockAuthSession(otherUser);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockTruckOwner.id, // Different owner
      });

      const result = await clearTruckHours("clh7xv2k90000000");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("אינך מורשה");
      }
    });

    it("returns error when truck not found", async () => {
      mockAuthSession(mockTruckOwner);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue(null);

      const result = await clearTruckHours("clh7xv2k90000000");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("העגלה לא נמצאה");
      }
    });

    it("calls revalidatePath for truck and dashboard", async () => {
      const { revalidatePath } = await import("next/cache");

      mockAuthSession(mockTruckOwner);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockTruckOwner.id,
      });
      mockPrisma.truckHours.deleteMany.mockResolvedValue({ count: 5 });

      await clearTruckHours("clh7xv2k90000000");

      expect(revalidatePath).toHaveBeenCalledWith("/trucks/clh7xv2k90000000");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("handles database errors gracefully", async () => {
      mockAuthSession(mockTruckOwner);
      mockPrisma.coffeeTruck.findUnique.mockResolvedValue({
        ownerId: mockTruckOwner.id,
      });
      mockPrisma.truckHours.deleteMany.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await clearTruckHours("clh7xv2k90000000");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("שגיאה במחיקת שעות הפעילות");
      }
    });
  });

  describe("checkIsOpenNow", () => {
    const now = new Date();
    const currentDay = now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const currentHour = now.getHours();
    const _currentMinutes = currentHour * 60;

    const mockOpenHours: TruckHours[] = [
      {
        id: "hours-1",
        truckId: "clh7xv2k90000000",
        dayOfWeek: currentDay,
        openTime: "00:00",
        closeTime: "23:59",
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it("returns true when currently open", async () => {
      mockPrisma.truckHours.findMany.mockResolvedValue(mockOpenHours);

      const result = await checkIsOpenNow("clh7xv2k90000000");

      if (result.success) {
        expect(result.data?.isOpen).toBe(true);
      } else {
        throw new Error("Expected success");
      }
    });

    it("returns false when currently closed (past hours)", async () => {
      const pastHours: TruckHours[] = [
        {
          id: "hours-1",
          truckId: "clh7xv2k90000000",
          dayOfWeek: currentDay,
          openTime: "00:00",
          closeTime: "01:00",
          isClosed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.truckHours.findMany.mockResolvedValue(pastHours);

      const result = await checkIsOpenNow("clh7xv2k90000000");

      if (result.success) {
        expect(result.data?.isOpen).toBe(false);
      } else {
        throw new Error("Expected success");
      }
    });

    it("returns false when currently closed (future hours)", async () => {
      const futureHours: TruckHours[] = [
        {
          id: "hours-1",
          truckId: "clh7xv2k90000000",
          dayOfWeek: currentDay,
          openTime: "23:00",
          closeTime: "23:59",
          isClosed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.truckHours.findMany.mockResolvedValue(futureHours);

      const result = await checkIsOpenNow("clh7xv2k90000000");

      if (result.success) {
        expect(result.data?.isOpen).toBe(false);
      } else {
        throw new Error("Expected success");
      }
    });

    it("returns false when day is marked closed", async () => {
      const closedDay: TruckHours[] = [
        {
          id: "hours-1",
          truckId: "clh7xv2k90000000",
          dayOfWeek: currentDay,
          openTime: null,
          closeTime: null,
          isClosed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.truckHours.findMany.mockResolvedValue(closedDay);

      const result = await checkIsOpenNow("clh7xv2k90000000");

      if (result.success) {
        expect(result.data?.isOpen).toBe(false);
      } else {
        throw new Error("Expected success");
      }
    });

    it("returns false when no hours are set", async () => {
      mockPrisma.truckHours.findMany.mockResolvedValue([]);

      const result = await checkIsOpenNow("clh7xv2k90000000");

      if (result.success) {
        expect(result.data?.isOpen).toBe(false);
      } else {
        throw new Error("Expected success");
      }
    });

    it("returns false when no hours for today", async () => {
      const otherDayHours: TruckHours[] = [
        {
          id: "hours-1",
          truckId: "clh7xv2k90000000",
          dayOfWeek: ((currentDay + 1) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          openTime: "09:00",
          closeTime: "17:00",
          isClosed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.truckHours.findMany.mockResolvedValue(otherDayHours);

      const result = await checkIsOpenNow("clh7xv2k90000000");

      if (result.success) {
        expect(result.data?.isOpen).toBe(false);
      } else {
        throw new Error("Expected success");
      }
    });

    it("handles database errors gracefully", async () => {
      mockPrisma.truckHours.findMany.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await checkIsOpenNow("clh7xv2k90000000");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.message).toBe("שגיאה בבדיקת סטטוס");
      }
    });
  });
});
