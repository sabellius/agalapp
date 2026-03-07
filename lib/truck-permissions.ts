/**
 * Truck permission checking based on tier and expiry
 */

import type { CoffeeTruck } from "@/generated/prisma";
import type { TruckTier } from "./tiers";
import { isCurrentlyPremium } from "./tiers";

export function canShowWorkingHours(
  truck: Pick<CoffeeTruck, "tier" | "tierExpiryAt">,
): boolean {
  return isCurrentlyPremium(truck.tier as TruckTier, truck.tierExpiryAt);
}

export function canEditWorkingHours(
  truck: Pick<CoffeeTruck, "tier" | "tierExpiryAt">,
): boolean {
  return canShowWorkingHours(truck);
}

export function isTruckVerified(
  truck: Pick<CoffeeTruck, "tier" | "tierExpiryAt">,
): boolean {
  return isCurrentlyPremium(truck.tier as TruckTier, truck.tierExpiryAt);
}

export function getTierName(tier: string, tierExpiryAt: Date | null): string {
  const tierKey = tier as TruckTier;

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
