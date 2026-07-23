"use client";

import { Check, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { upgradeAccount } from "@/app/actions/subscription";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PREMIUM_DURATION_DAYS, PREMIUM_FEATURES, PRICING } from "@/lib/tiers";

interface UpgradePromptProps {
  featureName: string;
}

export function UpgradePrompt({ featureName }: UpgradePromptProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleUpgrade() {
    setIsPending(true);
    setError("");
    const result = await upgradeAccount();
    setIsPending(false);

    if (result.success) {
      setSuccess(true);
      setOpen(false);
      router.refresh();
    } else {
      setError(result.message);
    }
  }

  if (success) {
    return (
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-6 text-center">
          <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">המנוי שודרג!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            החשבון שלך כעת במנוי פרימיום ל-{PREMIUM_DURATION_DAYS} יום
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          שדרג לפרימיום
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          כדי להוסיף <strong>{featureName}</strong>, עליך לשדרג את החשבון למנוי
          פרימיום
        </p>

        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium">עם מנוי פרימיום תקבל:</p>
          <ul className="space-y-1">
            {Object.values(PREMIUM_FEATURES).map((label) => (
              <li key={label} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="w-full">
              שדרג עכשיו - {PRICING.currency}
              {PRICING.monthly}/חודש
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>שדרוג למנוי פרימיום</DialogTitle>
              <DialogDescription>
                המנוי יהיה פעיל ל-{PREMIUM_DURATION_DAYS} ימים בעלות של{" "}
                {PRICING.currency}
                {PRICING.monthly} לחודש.
              </DialogDescription>
            </DialogHeader>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                ביטול
              </Button>
              <Button
                type="button"
                onClick={handleUpgrade}
                disabled={isPending}
              >
                {isPending ? "משדרג..." : "אישור שדרוג"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
