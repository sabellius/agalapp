import { Calendar, Crown, Info } from "lucide-react";
import { headers } from "next/headers";
import { downgradeAccount } from "@/app/actions/subscription";
import { UpgradePrompt } from "@/components/trucks/upgrade-prompt";
import { UserTierBadge } from "@/components/trucks/user-tier-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getExpiryDateString,
  getTierName,
  isExpiringSoon,
} from "@/lib/truck-permissions";

export default async function SubscriptionPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: {
      id: true,
      name: true,
      email: true,
      tier: true,
      tierExpiryAt: true,
    },
  });

  if (!user) return null;

  const tierName = getTierName(user.tier, user.tierExpiryAt);
  const expiryDate = getExpiryDateString(user.tierExpiryAt);
  const isExpiring = isExpiringSoon(user.tierExpiryAt);

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">הגדרות מנוי</h1>
      <p className="text-muted-foreground mb-8">
        {user.name || user.email} • {tierName}
      </p>

      <div className="space-y-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              סטטוס מנוי
            </CardTitle>
            <CardDescription>
              {user.tier === "PREMIUM" && !user.tierExpiryAt
                ? "מנוי פרימיום"
                : user.tier === "PREMIUM"
                  ? `מנוי פרימיום עד ${expiryDate}`
                  : "מנוי חינם"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isExpiring && (
              <div className="flex items-center gap-2 text-sm text-warning mb-4">
                <Calendar className="h-4 w-4" />
                המנוי פג ב-30 יום או פחות
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">סטטוס:</span>
              <UserTierBadge user={user} showVerified />
            </div>
          </CardContent>
        </Card>

        {/* Upgrade or Downgrade */}
        {user.tier === "FREE" ? (
          <UpgradePrompt featureName="שעות פעילות" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>ניהול מנוי</CardTitle>
              <CardDescription>
                ביטול המנוי יחזיר את החשבון למנוי חינם
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
                <Info className="h-4 w-4 mt-0.5" />
                <p>
                  לאחר ביטול המנוי, שעות הפעילות והתפריט לא יוצגו יותר ללקוחות,
                  אך הנתונים יישמרו.
                </p>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <form
                action={async () => {
                  "use server";
                  await downgradeAccount();
                }}
              >
                <Button variant="outline" type="submit">
                  בטל מנוי פרימיום
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Pricing Info */}
        <Card>
          <CardHeader>
            <CardTitle>מחירות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>חודשי</span>
                <span className="font-semibold">₪30/חודש</span>
              </div>
              <div className="flex justify-between">
                <span>שנתי</span>
                <span className="font-semibold">₪300/שנה (חיסכון 25%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
