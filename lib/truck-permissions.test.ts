import { describe, expect, it } from "vitest";
import type { User } from "@/generated/prisma/client";
import {
  canShowWorkingHours,
  canEditWorkingHours,
  isUserVerified,
  getTierName,
  getExpiryDateString,
  isExpiringSoon,
} from "./truck-permissions";

describe("truck-permissions", () => {
  const freeUser: Pick<User, "tier" | "tierExpiryAt"> = {
    tier: "FREE",
    tierExpiryAt: null,
  };

  const premiumUser: Pick<User, "tier" | "tierExpiryAt"> = {
    tier: "PREMIUM",
    tierExpiryAt: null,
  };

  const premiumUserWithFutureExpiry: Pick<User, "tier" | "tierExpiryAt"> = {
    tier: "PREMIUM",
    tierExpiryAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  const expiredPremiumUser: Pick<User, "tier" | "tierExpiryAt"> = {
    tier: "PREMIUM",
    tierExpiryAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  };

  describe("canShowWorkingHours", () => {
    it("returns false for free tier users", () => {
      expect(canShowWorkingHours(freeUser)).toBe(false);
    });

    it("returns true for premium users with no expiry", () => {
      expect(canShowWorkingHours(premiumUser)).toBe(true);
    });

    it("returns true for premium users with future expiry", () => {
      expect(canShowWorkingHours(premiumUserWithFutureExpiry)).toBe(true);
    });

    it("returns false for expired premium users", () => {
      expect(canShowWorkingHours(expiredPremiumUser)).toBe(false);
    });
  });

  describe("canEditWorkingHours", () => {
    it("returns same result as canShowWorkingHours", () => {
      expect(canEditWorkingHours(freeUser)).toBe(canShowWorkingHours(freeUser));
      expect(canEditWorkingHours(premiumUser)).toBe(canShowWorkingHours(premiumUser));
      expect(canEditWorkingHours(expiredPremiumUser)).toBe(
        canShowWorkingHours(expiredPremiumUser),
      );
    });
  });

  describe("isUserVerified", () => {
    it("returns false for free tier users", () => {
      expect(isUserVerified(freeUser)).toBe(false);
    });

    it("returns true for premium users with no expiry", () => {
      expect(isUserVerified(premiumUser)).toBe(true);
    });

    it("returns true for premium users with future expiry", () => {
      expect(isUserVerified(premiumUserWithFutureExpiry)).toBe(true);
    });

    it("returns false for expired premium users", () => {
      expect(isUserVerified(expiredPremiumUser)).toBe(false);
    });
  });

  describe("getTierName", () => {
    it("returns 'חינם' for FREE tier", () => {
      expect(getTierName("FREE", null)).toBe("חינם");
    });

    it("returns 'פרימיום' for active PREMIUM tier", () => {
      expect(getTierName("PREMIUM", null)).toBe("פרימיום");
      expect(getTierName("PREMIUM", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))).toBe(
        "פרימיום",
      );
    });

    it("returns 'פרימיום (פג תוקף)' for expired PREMIUM tier", () => {
      expect(getTierName("PREMIUM", new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))).toBe(
        "פרימיום (פג תוקף)",
      );
    });
  });

  describe("getExpiryDateString", () => {
    it("returns null when tierExpiryAt is null", () => {
      expect(getExpiryDateString(null)).toBeNull();
    });

    it("returns formatted Hebrew date string", () => {
      const date = new Date("2025-03-15");
      const result = getExpiryDateString(date);
      expect(result).toContain("2025");
      expect(result).toContain("מרץ");
    });
  });

  describe("isExpiringSoon", () => {
    it("returns false when tierExpiryAt is null", () => {
      expect(isExpiringSoon(null)).toBe(false);
    });

    it("returns true when expiry is within 7 days", () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 5);
      expect(isExpiringSoon(soon)).toBe(true);
    });

    it("returns true when expiry is exactly 7 days away", () => {
      const week = new Date();
      week.setDate(week.getDate() + 7);
      expect(isExpiringSoon(week)).toBe(true);
    });

    it("returns false when expiry is more than 7 days away", () => {
      const future = new Date();
      future.setDate(future.getDate() + 8);
      expect(isExpiringSoon(future)).toBe(false);
    });

    it("returns false when expiry has already passed", () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(isExpiringSoon(past)).toBe(false);
    });
  });
});
