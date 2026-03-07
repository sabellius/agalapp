"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; message: string };

/**
 * Upgrade user account to premium tier (mock payment for portfolio)
 * Grants premium for 30 days
 */
export async function upgradeAccount(): Promise<
  ActionResult<{ expiryDate: Date }>
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true },
    });

    if (!user) {
      return { success: false, message: "משתמש לא נמצא" };
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        tier: "PREMIUM",
        tierExpiryAt: expiryDate,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscription");

    return { success: true, data: { expiryDate } };
  } catch (error) {
    console.error("Upgrade error:", error);
    return { success: false, message: "שגיאה בשדרוג" };
  }
}

/**
 * Downgrade user account from premium to free tier
 */
export async function downgradeAccount(): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        tier: "FREE",
        tierExpiryAt: null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscription");

    return { success: true };
  } catch (error) {
    console.error("Downgrade error:", error);
    return { success: false, message: "שגיאה בביטול המנוי" };
  }
}
