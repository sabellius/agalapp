/**
 * Truck permission checking based on owner's user tier and expiry
 */

import type { User } from "@/generated/prisma";
import type { UserTier } from "./tiers";
import { isCurrentlyPremium } from "./tiers";

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
    (tierExpiryAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
}

export function getMaxAttributes(user: Pick<User, "tier" | "tierExpiryAt">): number {
  return isCurrentlyPremium(user.tier as UserTier, user.tierExpiryAt)
    ? Infinity
    : 3;
}

export function canAddAttribute(
  user: Pick<User, "tier" | "tierExpiryAt">,
  currentAttributeCount: number,
): boolean {
  const max = getMaxAttributes(user);
  return currentAttributeCount < max;
}
