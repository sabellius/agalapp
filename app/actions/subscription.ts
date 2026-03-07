"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; message: string };

/**
 * Upgrade a truck to premium tier (mock payment for portfolio)
 * Grants premium for 30 days
 */
export async function upgradeTruck(
  truckId: string,
): Promise<ActionResult<{ expiryDate: Date }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    if (truck.ownerId !== session.user.id) {
      return { success: false, message: "אין לך הרשאה לשדרג עגלה זו" };
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await prisma.coffeeTruck.update({
      where: { id: truckId },
      data: {
        tier: "PREMIUM",
        tierExpiryAt: expiryDate,
      },
    });

    revalidatePath(`/trucks/${truckId}`);
    revalidatePath("/dashboard");

    return { success: true, data: { expiryDate } };
  } catch (error) {
    console.error("Upgrade error:", error);
    return { success: false, message: "שגיאה בשדרוג" };
  }
}

/**
 * Downgrade a truck from premium to free tier
 */
export async function downgradeTruck(truckId: string): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    if (truck.ownerId !== session.user.id) {
      return { success: false, message: "אין לך הרשאה" };
    }

    await prisma.coffeeTruck.update({
      where: { id: truckId },
      data: {
        tier: "FREE",
        tierExpiryAt: null,
      },
    });

    revalidatePath(`/trucks/${truckId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Downgrade error:", error);
    return { success: false, message: "שגיאה בביטול המנוי" };
  }
}
