import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CoffeeTruck } from "@/generated/prisma/client";
import { isCurrentlyPremium } from "@/lib/tiers";

interface TruckTierBadgeProps {
  truck: Pick<CoffeeTruck, "tier" | "tierExpiryAt">;
  showVerified?: boolean;
}

export function TruckTierBadge({
  truck,
  showVerified = false,
}: TruckTierBadgeProps) {
  const isPremium = isCurrentlyPremium(truck.tier, truck.tierExpiryAt);

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
