import { render, screen } from "@testing-library/react";
import type { User } from "@/generated/prisma/client";
import { UserTierBadge } from "./user-tier-badge";

describe("UserTierBadge", () => {
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

  it("returns null for free tier users", () => {
    const { container } = render(<UserTierBadge user={freeUser} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null for expired premium users", () => {
    const { container } = render(<UserTierBadge user={expiredPremiumUser} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders premium badge for active premium users", () => {
    render(<UserTierBadge user={premiumUser} />);
    expect(screen.getByText("פרימיום")).toBeInTheDocument();
  });

  it("renders premium badge for premium users with future expiry", () => {
    render(<UserTierBadge user={premiumUserWithFutureExpiry} />);
    expect(screen.getByText("פרימיום")).toBeInTheDocument();
  });

  it("renders verified badge when showVerified is true for premium users", () => {
    render(<UserTierBadge user={premiumUser} showVerified />);
    expect(screen.getByText("מאומת")).toBeInTheDocument();
    expect(screen.queryByText("פרימיום")).not.toBeInTheDocument();
  });

  it("returns null when showVerified is true but user is not premium", () => {
    const { container } = render(<UserTierBadge user={freeUser} showVerified />);
    expect(container.firstChild).toBeNull();
  });
});
