"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import type { ActionResult } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { safeAction, withAuth } from "@/lib/safe-action";
import { canAddAttribute, canModifyTruck } from "@/lib/truck-permissions";
import {
  addTruckAttributeSchema,
  removeTruckAttributeSchema,
  setTruckAttributesSchema,
} from "@/lib/validations/attribute-schema";

export function getTruckAttributes() {
  return safeAction(async () => {
    const attributes = await prisma.truckAttribute.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, nameEn: true, icon: true },
    });
    return { success: true as const, data: attributes };
  }, "שגיאה בטעינת המאפיינים");
}

export function getTruckAssignedAttributes(truckId: string) {
  return safeAction(async () => {
    const assignments = await prisma.truckAttributeAssignment.findMany({
      where: { truckId },
      include: {
        attribute: {
          select: { id: true, name: true, nameEn: true, icon: true },
        },
      },
      orderBy: { attribute: { sortOrder: "asc" } },
    });

    const data = assignments.map((assignment) => ({
      ...assignment.attribute,
      assignedId: assignment.id,
    }));

    return { success: true as const, data };
  }, "שגיאה בטעינת המאפיינים");
}

export function setTruckAttributes(
  input: z.infer<typeof setTruckAttributesSchema>,
) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const validated = setTruckAttributesSchema.parse(input);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, tier: true, tierExpiryAt: true },
      });
      if (!user) {
        return { success: false, message: "משתמש לא נמצא" } as ActionResult;
      }

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

      if (!canAddAttribute(user, validated.attributeIds.length)) {
        return {
          success: false,
          message: "מוגבל ל-3 מאפיינים בחינמי. שדרג לפרימיום להוספת עוד.",
        } as ActionResult;
      }

      const attributes = await prisma.truckAttribute.findMany({
        where: { id: { in: validated.attributeIds }, isActive: true },
        select: { id: true },
      });
      if (attributes.length !== validated.attributeIds.length) {
        return {
          success: false,
          message: "חלק מהמאפיינים לא קיימות",
        } as ActionResult;
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
      return { success: true as const };
    }, "שגיאה בשמירת המאפיינים");
  });
}

export function addTruckAttribute(
  input: z.infer<typeof addTruckAttributeSchema>,
) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const validated = addTruckAttributeSchema.parse(input);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, tier: true, tierExpiryAt: true },
      });
      if (!user) {
        return { success: false, message: "משתמש לא נמצא" } as ActionResult;
      }

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

      const currentCount = await prisma.truckAttributeAssignment.count({
        where: { truckId: validated.truckId },
      });
      if (!canAddAttribute(user, currentCount)) {
        return {
          success: false,
          message: "מוגבל ל-3 מאפיינים בחינמי. שדרג לפרימיום להוספת עוד.",
        } as ActionResult;
      }

      const attribute = await prisma.truckAttribute.findFirst({
        where: { id: validated.attributeId, isActive: true },
      });
      if (!attribute) {
        return { success: false, message: "המאפיין לא קיים" } as ActionResult;
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
        return {
          success: false,
          message: "המאפיין כבר משויך לעגלה זו",
        } as ActionResult;
      }

      await prisma.truckAttributeAssignment.create({
        data: {
          truckId: validated.truckId,
          attributeId: validated.attributeId,
        },
      });

      revalidatePath(`/trucks/${validated.truckId}`);
      revalidatePath("/dashboard");
      return { success: true as const };
    }, "שגיאה בהוספת המאפיין");
  });
}

export function removeTruckAttribute(
  input: z.infer<typeof removeTruckAttributeSchema>,
) {
  return withAuth(async (userId) => {
    return safeAction(async () => {
      const validated = removeTruckAttributeSchema.parse(input);

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
      return { success: true as const };
    }, "שגיאה בהסרת המאפיין");
  });
}
