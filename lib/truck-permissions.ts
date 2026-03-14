/**
 * Truck permission checking based on owner's user tier and expiry
 */

import type { Role, User } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import type { UserTier } from "./tiers";
import {
  EXPIRY_WARNING_DAYS,
  FREE_TIER_MAX_ATTRIBUTES,
  isCurrentlyPremium,
  MS_PER_DAY,
} from "./tiers";

export async function getUserRole(userId: string): Promise<Role | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role ?? null;
}

export async function canModifyTruck(
  userId: string,
  truckOwnerId: string,
): Promise<boolean> {
  if (userId === truckOwnerId) return true;
  const role = await getUserRole(userId);
  return role === "ADMIN";
}

export function canShowWorkingHours(
  user: Pick<User, "tier" | "tierExpiryAt">,
): boolean {
  return isCurrentlyPremium(user.tier as UserTier, user.tierExpiryAt);
}

export function canEditWorkingHours(
  user: Pick<User, "tier" | "tierExpiryAt">,
): boolean {
  return canShowWorkingHours(user);
}

export function isUserVerified(
  user: Pick<User, "tier" | "tierExpiryAt">,
): boolean {
  return isCurrentlyPremium(user.tier as UserTier, user.tierExpiryAt);
}

export function getTierName(tier: string, tierExpiryAt: Date | null): string {
  const tierKey = tier as UserTier;

  // Handle expired premium separately
  if (tierKey === "PREMIUM" && tierExpiryAt && new Date() > tierExpiryAt) {
    return "פרימיום (פג תוקף)";
  }

  return tierKey === "PREMIUM" ? "פרימיום" : "חינם";
}

export function getExpiryDateString(tierExpiryAt: Date | null): string | null {
  if (!tierExpiryAt) return null;

  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(tierExpiryAt);
}

export function isExpiringSoon(tierExpiryAt: Date | null): boolean {
  if (!tierExpiryAt) return false;

  const daysUntilExpiry = Math.ceil(
    (tierExpiryAt.getTime() - Date.now()) / MS_PER_DAY,
  );

  return daysUntilExpiry > 0 && daysUntilExpiry <= EXPIRY_WARNING_DAYS;
}

export function getMaxAttributes(
  user: Pick<User, "tier" | "tierExpiryAt">,
): number {
  return isCurrentlyPremium(user.tier as UserTier, user.tierExpiryAt)
    ? Infinity
    : FREE_TIER_MAX_ATTRIBUTES;
}

export function canAddAttribute(
  user: Pick<User, "tier" | "tierExpiryAt">,
  currentAttributeCount: number,
): boolean {
  const max = getMaxAttributes(user);
  return currentAttributeCount < max;
}
