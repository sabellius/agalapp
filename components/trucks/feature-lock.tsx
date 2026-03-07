"use client";

import { Crown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FeatureLockProps {
  title: string;
  description: string;
  currentCount?: number;
  maxCount?: number;
}

export function FeatureLock({
  title,
  description,
  currentCount = 0,
  maxCount = 3,
}: FeatureLockProps) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">
          {currentCount} מ-{maxCount} בשימוש כרגע
        </p>
        <Link href="/subscription" className="block">
          <Button variant="default" size="sm" className="w-full">
            שדרג לפרימיום
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
