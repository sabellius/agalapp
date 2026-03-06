/**
 * Truck tier system for owner subscriptions
 */

export type TruckTier = "FREE" | "PREMIUM";

export interface TierConfig {
  name: string;
  nameEn: string;
}

export const TRUCK_TIERS: Record<TruckTier, TierConfig> = {
  FREE: {
    name: "חינם",
    nameEn: "Free",
  },
  PREMIUM: {
    name: "פרימיום",
    nameEn: "Premium",
  },
} as const;

export const PREMIUM_FEATURES = {
  working_hours: "שעות פעילות",
} as const;

export type PremiumFeature = keyof typeof PREMIUM_FEATURES;

export const PRICING = {
  monthly: 30,
  yearly: 300,
  currency: "₪",
} as const;

export function isTierExpired(tierExpiryAt: Date | null): boolean {
  if (!tierExpiryAt) return false;
  return new Date() > tierExpiryAt;
}

export function isCurrentlyPremium(tier: TruckTier, tierExpiryAt: Date | null): boolean {
  return tier === "PREMIUM" && !isTierExpired(tierExpiryAt);
}

export function getPrice(monthly: boolean): string {
  const price = monthly ? PRICING.monthly : PRICING.yearly;
  const period = monthly ? "חודש" : "שנה";
  return `${PRICING.currency}${price}/${period}`;
}

export function isPremiumFeature(feature: string): feature is PremiumFeature {
  return feature in PREMIUM_FEATURES;
}
