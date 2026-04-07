"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ZodError, type z } from "zod";
import type { ActionResult } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAddAttribute, canModifyTruck } from "@/lib/truck-permissions";
import {
  addTruckAttributeSchema,
  removeTruckAttributeSchema,
  setTruckAttributesSchema,
} from "@/lib/validations/attribute-schema";

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

export async function setTruckAttributes(
  input: z.infer<typeof setTruckAttributesSchema>,
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = setTruckAttributesSchema.parse(input);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, tier: true, tierExpiryAt: true },
    });

    if (!user) {
      return { success: false, message: "משתמש לא נמצא" };
    }

    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: validated.truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    if (!(await canModifyTruck(session.user.id, truck.ownerId))) {
      return { success: false, message: "אינך מורשה לערוך עגלה זו" };
    }

    if (!canAddAttribute(user, validated.attributeIds.length)) {
      return {
        success: false,
        message: "מוגבל ל-3 מאפיינים בחינמי. שדרג לפרימיום להוספת עוד.",
      };
    }

    const attributes = await prisma.truckAttribute.findMany({
      where: {
        id: { in: validated.attributeIds },
        isActive: true,
      },
      select: { id: true },
    });

    if (attributes.length !== validated.attributeIds.length) {
      return { success: false, message: "חלק מהמאפיינים לא קיימות" };
    }

    await prisma.truckAttributeAssignment.deleteMany({
      where: { truckId: validated.truckId },
    });

    if (validated.attributeIds.length > 0) {
      await prisma.truckAttributeAssignment.createMany({
        data: validated.attributeIds.map((attributeId) => ({
          truckId: validated.truckId,
          attributeId,
        })),
      });
    }

    revalidatePath(`/trucks/${validated.truckId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Set attributes error:", error);
    return { success: false, message: "שגיאה בשמירת המאפיינים" };
  }
}

export async function addTruckAttribute(
  input: z.infer<typeof addTruckAttributeSchema>,
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = addTruckAttributeSchema.parse(input);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, tier: true, tierExpiryAt: true },
    });

    if (!user) {
      return { success: false, message: "משתמש לא נמצא" };
    }

    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: validated.truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    if (!(await canModifyTruck(session.user.id, truck.ownerId))) {
      return { success: false, message: "אינך מורשה לערוך עגלה זו" };
    }

    const currentCount = await prisma.truckAttributeAssignment.count({
      where: { truckId: validated.truckId },
    });

    if (!canAddAttribute(user, currentCount)) {
      return {
        success: false,
        message: "מוגבל ל-3 מאפיינים בחינמי. שדרג לפרימיום להוספת עוד.",
      };
    }

    const attribute = await prisma.truckAttribute.findFirst({
      where: { id: validated.attributeId, isActive: true },
    });

    if (!attribute) {
      return { success: false, message: "המאפיין לא קיים" };
    }

    const existing = await prisma.truckAttributeAssignment.findUnique({
      where: {
        truckId_attributeId: {
          truckId: validated.truckId,
          attributeId: validated.attributeId,
        },
      },
    });

    if (existing) {
      return { success: false, message: "המאפיין כבר משויך לעגלה זו" };
    }

    await prisma.truckAttributeAssignment.create({
      data: {
        truckId: validated.truckId,
        attributeId: validated.attributeId,
      },
    });

    revalidatePath(`/trucks/${validated.truckId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Add attribute error:", error);
    return { success: false, message: "שגיאה בהוספת המאפיין" };
  }
}

export async function removeTruckAttribute(
  input: z.infer<typeof removeTruckAttributeSchema>,
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "אינך מחובר" };
    }

    const validated = removeTruckAttributeSchema.parse(input);

    const truck = await prisma.coffeeTruck.findUnique({
      where: { id: validated.truckId },
      select: { ownerId: true },
    });

    if (!truck) {
      return { success: false, message: "העגלה לא נמצאה" };
    }

    if (!(await canModifyTruck(session.user.id, truck.ownerId))) {
      return { success: false, message: "אינך מורשה לערוך עגלה זו" };
    }

    await prisma.truckAttributeAssignment.delete({
      where: {
        truckId_attributeId: {
          truckId: validated.truckId,
          attributeId: validated.attributeId,
        },
      },
    });

    revalidatePath(`/trucks/${validated.truckId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message ?? "נתונים לא תקינים",
      };
    }
    console.error("Remove attribute error:", error);
    return { success: false, message: "שגיאה בהסרת המאפיין" };
  }
}
