/**
 * User tier system for owner subscriptions
 */

export type UserTier = "FREE" | "PREMIUM";

export const PREMIUM_DURATION_DAYS = 30;
export const FREE_TIER_MAX_ATTRIBUTES = 3;
export const EXPIRY_WARNING_DAYS = 7;
export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface TierConfig {
  name: string;
  nameEn: string;
}

export const USER_TIERS: Record<UserTier, TierConfig> = {
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

export function isCurrentlyPremium(
  tier: UserTier,
  tierExpiryAt: Date | null,
): boolean {
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
