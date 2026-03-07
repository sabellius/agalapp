"use client";

import { Check, Crown } from "lucide-react";
import { useActionState } from "react";
import { upgradeTruck } from "@/app/actions/subscription";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UpgradePromptProps {
  truckId: string;
  featureName: string;
}

const PREMIUM_FEATURES = [
  { key: "working_hours", label: "שעות פעילות" },
  { key: "menu", label: "תפריט מלא" },
] as const;

export function UpgradePrompt({ truckId, featureName }: UpgradePromptProps) {
  const [state, formAction, isPending] = useActionState(
    upgradeTruck.bind(null, truckId),
    {
      success: false,
      message: "",
    },
  );

  if (state.success) {
    return (
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-6 text-center">
          <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">המנוי שודרג!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            העגלה שלך כעת במנוי פרימיום ל-30 יום
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
          כדי להוסיף <strong>{featureName}</strong>, עליך לשדרג את העגלה למנוי
          פרימיום
        </p>

        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium">עם מנוי פרימיום תקבל:</p>
          <ul className="space-y-1">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f.key} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        {state.message && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}
      </CardContent>
      <CardFooter>
        <form action={formAction}>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "משדרג..." : "שדרג עכשיו - ₪30/חודש"}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
