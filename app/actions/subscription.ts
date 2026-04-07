"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { safeAction, withAuth } from "@/lib/safe-action";
import { PREMIUM_DURATION_DAYS } from "@/lib/tiers";

export function upgradeAccount() {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true },
      });
      if (!user) {
        return { success: false, message: "משתמש לא נמצא" } as ActionResult<{
          expiryDate: Date;
        }>;
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + PREMIUM_DURATION_DAYS);

      await prisma.user.update({
        where: { id: userId },
        data: { tier: "PREMIUM", tierExpiryAt: expiryDate },
      });

      revalidatePath("/dashboard");
      revalidatePath("/subscription");
      return { success: true as const, data: { expiryDate } };
    }, "שגיאה בשדרוג");
  });
}

export function downgradeAccount() {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { tier: "FREE", tierExpiryAt: null },
      });

      revalidatePath("/dashboard");
      revalidatePath("/subscription");
      return { success: true as const };
    }, "שגיאה בביטול המנוי");
  });
}
