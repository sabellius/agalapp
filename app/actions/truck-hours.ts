"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { TruckHours } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { DayOfWeek } from "@/lib/truck-hours";
import { getBlankWeeklyHours } from "@/lib/truck-hours";
import { canEditWorkingHours } from "@/lib/truck-permissions";
import type { WeeklyHoursInput } from "@/lib/validations/truck-hours-schema";
import { weeklyHoursSchema } from "@/lib/validations/truck-hours-schema";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; message: string };

/**
 * Get working hours for a truck
 */
export async function getTruckHours(
  truckId: string,
): Promise<ActionResult<TruckHours[]>> {
  try {
    const hours = await prisma.truckHours.findMany({
      where: { truckId },
      orderBy: { dayOfWeek: "asc" },
    });

    // If no hours, return blank array
    if (hours.length === 0) {
      const blank = getBlankWeeklyHours();
      return { success: true, data: blank as unknown as TruckHours[] };
    }

    return { success: true, data: hours };
  } catch (error) {
    console.error("Get hours error:", error);
    return { success: false, message: "שגיאה בטעינת שעות הפעילות" };
  }
}

/**
 * Set working hours for a truck (premium only)
 */
export async function setTruckHours(
  input: WeeklyHoursInput,
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    // Get user with tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, tier: true, tierExpiryAt: true },
    });

    if (!user) {
      return { success: false, message: "משתמש לא נמצא" };
    }

    // Check premium permission
    if (!canEditWorkingHours(user)) {
      return { success: false, message: "שעות פעילות זמינות למנוי פרימיום" };
    }

    // Validate input
    const validated = weeklyHoursSchema.parse(input);

    // Verify ownership
    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: validated.truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    if (truck.ownerId !== session.user.id) {
      return { success: false, message: "אינך מורשה לערוך עגלה זו" };
    }

    // Delete existing hours
    await prisma.truckHours.deleteMany({
      where: { truckId: validated.truckId },
    });

    // Create new hours (skip closed days with no times)
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
        // Store explicitly closed days
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

    return { success: true };
  } catch (error) {
    console.error("Set hours error:", error);
    return { success: false, message: "שגיאה בשמירת שעות הפעילות" };
  }
}

/**
 * Clear all hours for a truck
 */
export async function clearTruckHours(truckId: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    // Verify ownership
    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    if (truck.ownerId !== session.user.id) {
      return { success: false, message: "אינך מורשה" };
    }

    await prisma.truckHours.deleteMany({
      where: { truckId },
    });

    revalidatePath(`/trucks/${truckId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Clear hours error:", error);
    return { success: false, message: "שגיאה במחיקת שעות הפעילות" };
  }
}

/**
 * Check if truck is open right now
 */
export async function checkIsOpenNow(
  truckId: string,
): Promise<ActionResult<{ isOpen: boolean }>> {
  try {
    const hours = await prisma.truckHours.findMany({
      where: { truckId },
      orderBy: { dayOfWeek: "asc" },
    });

    if (hours.length === 0) {
      return { success: true, data: { isOpen: false } };
    }

    // Get current time in Israel
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
      return { success: true, data: { isOpen: false } };
    }

    const [openHour, openMin] = todayHours.openTime.split(":").map(Number);
    const [closeHour, closeMin] = todayHours.closeTime.split(":").map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    const isOpen =
      currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    return { success: true, data: { isOpen } };
  } catch (error) {
    console.error("Check open error:", error);
    return { success: false, message: "שגיאה בבדיקת סטטוס" };
  }
}
