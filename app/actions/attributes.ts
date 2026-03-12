"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ZodError } from "zod";
import type { ActionResult } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAddAttribute } from "@/lib/truck-permissions";

/**
 * Get all active truck attributes (for selection UI)
 */
export async function getTruckAttributes(): Promise<
  ActionResult<{ id: string; name: string; nameEn: string; icon: string }[]>
> {
  try {
    const attributes = await prisma.truckAttribute.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        nameEn: true,
        icon: true,
      },
    });

    return { success: true, data: attributes };
  } catch (error) {
    console.error("Get attributes error:", error);
    return { success: false, message: "שגיאה בטעינת המאפיינים" };
  }
}

/**
 * Get attributes assigned to a specific truck
 */
export async function getTruckAssignedAttributes(truckId: string): Promise<
  ActionResult<
    {
      id: string;
      name: string;
      nameEn: string;
      icon: string;
      assignedId: string;
    }[]
  >
> {
  try {
    const assignments = await prisma.truckAttributeAssignment.findMany({
      where: { truckId },
      include: {
        attribute: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            icon: true,
          },
        },
      },
      orderBy: {
        attribute: { sortOrder: "asc" },
      },
    });

    const data = assignments.map((assignment) => ({
      ...assignment.attribute,
      assignedId: assignment.id,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Get truck attributes error:", error);
    return { success: false, message: "שגיאה בטעינת המאפיינים" };
  }
}

/**
 * Set attributes for a truck (replaces all existing)
 * Free tier: max 3 attributes
 * Premium tier: unlimited
 */
export async function setTruckAttributes(input: {
  truckId: string;
  attributeIds: string[];
}): Promise<ActionResult> {
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

    // Verify ownership
    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: input.truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    if (truck.ownerId !== session.user.id) {
      return { success: false, message: "אינך מורשה לערוך עגלה זו" };
    }

    // Check tier limits
    if (!canAddAttribute(user, input.attributeIds.length)) {
      return {
        success: false,
        message: "מוגבל ל-3 מאפיינים בחינמי. שדרג לפרימיום להוספת עוד.",
      };
    }

    // Validate that all attributes exist
    const attributes = await prisma.truckAttribute.findMany({
      where: {
        id: { in: input.attributeIds },
        isActive: true,
      },
      select: { id: true },
    });

    if (attributes.length !== input.attributeIds.length) {
      return { success: false, message: "חלק מהמאפיינים לא קיימות" };
    }

    // Delete existing assignments
    await prisma.truckAttributeAssignment.deleteMany({
      where: { truckId: input.truckId },
    });

    // Create new assignments
    if (input.attributeIds.length > 0) {
      await prisma.truckAttributeAssignment.createMany({
        data: input.attributeIds.map((attributeId) => ({
          truckId: input.truckId,
          attributeId,
        })),
      });
    }

    revalidatePath(`/trucks/${input.truckId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Set attributes error:", error);
    return { success: false, message: "שגיאה בשמירת המאפיינים" };
  }
}

/**
 * Add a single attribute to a truck
 */
export async function addTruckAttribute(input: {
  truckId: string;
  attributeId: string;
}): Promise<ActionResult> {
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

    // Verify ownership
    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: input.truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    if (truck.ownerId !== session.user.id) {
      return { success: false, message: "אינך מורשה לערוך עגלה זו" };
    }

    // Check current attribute count
    const currentCount = await prisma.truckAttributeAssignment.count({
      where: { truckId: input.truckId },
    });

    if (!canAddAttribute(user, currentCount)) {
      return {
        success: false,
        message: "מוגבל ל-3 מאפיינים בחינמי. שדרג לפרימיום להוספת עוד.",
      };
    }

    // Validate attribute exists
    const attribute = await prisma.truckAttribute.findFirst({
      where: { id: input.attributeId, isActive: true },
    });

    if (!attribute) {
      return { success: false, message: "המאפיין לא קיים" };
    }

    // Check if already assigned
    const existing = await prisma.truckAttributeAssignment.findUnique({
      where: {
        truckId_attributeId: {
          truckId: input.truckId,
          attributeId: input.attributeId,
        },
      },
    });

    if (existing) {
      return { success: false, message: "המאפיין כבר משויך לעגלה זו" };
    }

    // Create assignment
    await prisma.truckAttributeAssignment.create({
      data: {
        truckId: input.truckId,
        attributeId: input.attributeId,
      },
    });

    revalidatePath(`/trucks/${input.truckId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        message: firstError?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Add attribute error:", error);
    return { success: false, message: "שגיאה בהוספת המאפיין" };
  }
}

/**
 * Remove a single attribute from a truck
 */
export async function removeTruckAttribute(input: {
  truckId: string;
  attributeId: string;
}): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    // Verify ownership
    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: input.truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    if (truck.ownerId !== session.user.id) {
      return { success: false, message: "אינך מורשה לערוך עגלה זו" };
    }

    // Delete assignment
    await prisma.truckAttributeAssignment.delete({
      where: {
        truckId_attributeId: {
          truckId: input.truckId,
          attributeId: input.attributeId,
        },
      },
    });

    revalidatePath(`/trucks/${input.truckId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Remove attribute error:", error);
    return { success: false, message: "שגיאה בהסרת המאפיין" };
  }
}
