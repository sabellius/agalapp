import { Calendar, Crown, Info } from "lucide-react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { downgradeTruck } from "@/app/actions/subscription";
import { TruckTierBadge } from "@/components/trucks/truck-tier-badge";
import { UpgradePrompt } from "@/components/trucks/upgrade-prompt";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import {
  getExpiryDateString,
  getTierName,
  isExpiringSoon,
} from "@/lib/truck-permissions";

export default async function TruckSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;

  const truck = await prisma.coffeeTruck.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      tier: true,
      tierExpiryAt: true,
      ownerId: true,
    },
  });

  if (!truck) {
    notFound();
  }

  if (truck.ownerId !== session.user.id) {
    redirect("/dashboard");
  }

  const tierName = getTierName(truck.tier, truck.tierExpiryAt);
  const expiryDate = getExpiryDateString(truck.tierExpiryAt);
  const isExpiring = isExpiringSoon(truck.tierExpiryAt);

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">הגדרות מנוי</h1>
      <p className="text-muted-foreground mb-8">
        {truck.name} • {tierName}
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
              {truck.tier === "PREMIUM" && !truck.tierExpiryAt
                ? "מנוי פרימיום"
                : truck.tier === "PREMIUM"
                  ? `מנוי פרימיום עד ${expiryDate}`
                  : "מנוי חינם"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isExpiring && (
              <div className="flex items-center gap-2 text-sm text-orange-600 mb-4">
                <Calendar className="h-4 w-4" />
                המנוי פג ב-30 יום או פחות
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">סטטוס:</span>
              <TruckTierBadge truck={truck} showVerified />
            </div>
          </CardContent>
        </Card>

        {/* Upgrade or Downgrade */}
        {truck.tier === "FREE" ? (
          <UpgradePrompt truckId={truck.id} featureName="שעות פעילות" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>ניהול מנוי</CardTitle>
              <CardDescription>
                ביטול המנוי יחזיר את העגלה למנוי חינם
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
                  await downgradeTruck(truck.id);
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
