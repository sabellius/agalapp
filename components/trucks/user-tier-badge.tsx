import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/generated/prisma/client";
import { isCurrentlyPremium } from "@/lib/tiers";

interface UserTierBadgeProps {
  user: Pick<User, "tier" | "tierExpiryAt">;
  showVerified?: boolean;
}

export function UserTierBadge({
  user,
  showVerified = false,
}: UserTierBadgeProps) {
  const isPremium = isCurrentlyPremium(user.tier, user.tierExpiryAt);

  if (isPremium && showVerified) {
    return (
      <Badge variant="secondary" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        מאומת
      </Badge>
    );
  }

  if (isPremium) {
    return <Badge variant="default">פרימיום</Badge>;
  }

  return null;
}
