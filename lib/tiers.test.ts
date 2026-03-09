import {
  getPrice,
  isCurrentlyPremium,
  isPremiumFeature,
  isTierExpired,
  type UserTier,
} from "./tiers";

describe("tiers", () => {
  describe("isTierExpired", () => {
    it("returns false when tierExpiryAt is null", () => {
      expect(isTierExpired(null)).toBe(false);
    });

    it("returns false when expiry date is in the future", () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      expect(isTierExpired(future)).toBe(false);
    });

    it("returns true when expiry date has passed", () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(isTierExpired(past)).toBe(true);
    });
  });

  describe("isCurrentlyPremium", () => {
    it("returns false when tier is FREE", () => {
      expect(isCurrentlyPremium("FREE", null)).toBe(false);
      expect(isCurrentlyPremium("FREE", new Date())).toBe(false);
    });

    it("returns true when tier is PREMIUM with no expiry", () => {
      expect(isCurrentlyPremium("PREMIUM", null)).toBe(true);
    });

    it("returns true when tier is PREMIUM with future expiry", () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      expect(isCurrentlyPremium("PREMIUM", future)).toBe(true);
    });

    it("returns false when tier is PREMIUM but expired", () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(isCurrentlyPremium("PREMIUM", past)).toBe(false);
    });
  });

  describe("getPrice", () => {
    it("returns monthly price", () => {
      expect(getPrice(true)).toBe("₪30/חודש");
    });

    it("returns yearly price", () => {
      expect(getPrice(false)).toBe("₪300/שנה");
    });
  });

  describe("isPremiumFeature", () => {
    it("returns true for valid premium features", () => {
      expect(isPremiumFeature("working_hours")).toBe(true);
    });

    it("returns false for invalid features", () => {
      expect(isPremiumFeature("invalid")).toBe(false);
      expect(isPremiumFeature("")).toBe(false);
    });
  });
});
