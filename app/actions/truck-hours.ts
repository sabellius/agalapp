"use server";

import { revalidatePath } from "next/cache";
import type { TruckHours } from "@/generated/prisma/client";
import type { ActionResult } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { safeAction, withAuth } from "@/lib/safe-action";
import type { DayOfWeek } from "@/lib/truck-hours";
import { getBlankWeeklyHours } from "@/lib/truck-hours";
import { canEditWorkingHours, canModifyTruck } from "@/lib/truck-permissions";
import type { WeeklyHoursInput } from "@/lib/validations/truck-hours-schema";
import { weeklyHoursSchema } from "@/lib/validations/truck-hours-schema";

export function getTruckHours(truckId: string) {
  return safeAction(async () => {
    const hours = await prisma.truckHours.findMany({
      where: { truckId },
      orderBy: { dayOfWeek: "asc" },
    });

    if (hours.length === 0) {
      const blank = getBlankWeeklyHours();
      return { success: true as const, data: blank as unknown as TruckHours[] };
    }

    return { success: true as const, data: hours };
  }, "שגיאה בטעינת שעות הפעילות");
}

export function setTruckHours(input: WeeklyHoursInput) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, tier: true, tierExpiryAt: true },
      });
      if (!user) {
        return { success: false, message: "משתמש לא נמצא" } as ActionResult;
      }

      if (!canEditWorkingHours(user)) {
        return {
          success: false,
          message: "שעות פעילות זמינות למנוי פרימיום",
        } as ActionResult;
      }

      const validated = weeklyHoursSchema.parse(input);

      const truck = await prisma.coffeeTruck.findUnique({
        where: { id: validated.truckId },
        select: { ownerId: true },
      });
      if (!truck) {
        return { success: false, message: "העגלה לא נמצאה" } as ActionResult;
      }
      if (!(await canModifyTruck(userId, truck.ownerId))) {
        return {
          success: false,
          message: "אינך מורשה לערוך עגלה זו",
        } as ActionResult;
      }

      await prisma.truckHours.deleteMany({
        where: { truckId: validated.truckId },
      });

      for (let i = 0; i < validated.hours.length; i++) {
        const dayHours = validated.hours[i];
        if (!dayHours.isClosed && dayHours.openTime && dayHours.closeTime) {
          await prisma.truckHours.create({
            data: {
              truckId: validated.truckId,
              dayOfWeek: dayHours.dayOfWeek,
              openTime: dayHours.openTime,
              closeTime: dayHours.closeTime,
              isClosed: false,
            },
          });
        } else if (dayHours.isClosed) {
          await prisma.truckHours.create({
            data: {
              truckId: validated.truckId,
              dayOfWeek: dayHours.dayOfWeek,
              openTime: null,
              closeTime: null,
              isClosed: true,
            },
          });
        }
      }

      revalidatePath(`/trucks/${validated.truckId}`);
      revalidatePath("/dashboard");
      return { success: true as const };
    }, "שגיאה בשמירת שעות הפעילות");
  });
}

export function clearTruckHours(truckId: string) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const truck = await prisma.coffeeTruck.findUnique({
        where: { id: truckId },
        select: { ownerId: true },
      });
      if (!truck) {
        return { success: false, message: "העגלה לא נמצאה" } as ActionResult;
      }
      if (!(await canModifyTruck(userId, truck.ownerId))) {
        return {
          success: false,
          message: "אינך מורשה לערוך עגלה זו",
        } as ActionResult;
      }

      await prisma.truckHours.deleteMany({ where: { truckId } });
      revalidatePath(`/trucks/${truckId}`);
      revalidatePath("/dashboard");
      return { success: true as const };
    }, "שגיאה במחיקת שעות הפעילות");
  });
}

export function checkIsOpenNow(truckId: string) {
  return safeAction(async () => {
    const hours = await prisma.truckHours.findMany({
      where: { truckId },
      orderBy: { dayOfWeek: "asc" },
    });

    if (hours.length === 0) {
      return { success: true as const, data: { isOpen: false } };
    }

    const now = new Date();
    const isoString = now.toISOString();
    const targetTime = new Date(
      new Date(isoString).toLocaleString("en-US", {
        timeZone: "Asia/Jerusalem",
      }),
    );
    const currentDay = targetTime.getDay() as DayOfWeek;
    const currentMinutes = targetTime.getHours() * 60 + targetTime.getMinutes();

    const todayHours = hours.find((h) => h.dayOfWeek === currentDay);

    if (
      !todayHours ||
      todayHours.isClosed ||
      !todayHours.openTime ||
      !todayHours.closeTime
    ) {
      return { success: true as const, data: { isOpen: false } };
    }

    const [openHour, openMin] = todayHours.openTime.split(":").map(Number);
    const [closeHour, closeMin] = todayHours.closeTime.split(":").map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    const isOpen =
      currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    return { success: true as const, data: { isOpen } };
  }, "שגיאה בבדיקת סטטוס");
}
