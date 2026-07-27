"use client";

import { Clock, Copy, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { setTruckHours } from "@/app/actions/truck-hours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { TruckHours } from "@/generated/prisma/client";
import { DAYS_OF_WEEK } from "@/lib/truck-hours";
import { cn } from "@/lib/utils";
import type { DayHoursInput } from "@/lib/validations/truck-hours-schema";

interface HoursEditorProps {
  truckId: string;
  existingHours: TruckHours[];
  onSuccess?: () => void;
}

export function HoursEditor({
  truckId,
  existingHours,
  onSuccess,
}: HoursEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{
    success: boolean;
    message: string;
  }>({ success: false, message: "" });

  // Convert existing hours to form format
  const getDefaultValues = (): Record<number, DayHoursInput> => {
    const defaults: Record<number, DayHoursInput> = {};
    for (const day of DAYS_OF_WEEK) {
      const existing = existingHours.find((h) => h.dayOfWeek === day.value);
      defaults[day.value] = {
        dayOfWeek: day.value as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        openTime: existing?.openTime ?? null,
        closeTime: existing?.closeTime ?? null,
        isClosed: existing?.isClosed ?? true,
      };
    }
    return defaults;
  };

  const [localValues, setLocalValues] = useState<Record<number, DayHoursInput>>(
    getDefaultValues(),
  );

  const updateDay = (dayOfWeek: number, updates: Partial<DayHoursInput>) => {
    setLocalValues((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], ...updates },
    }));
  };

  const copyToDays = (sourceDay: number, targetDays: number[]) => {
    const source = localValues[sourceDay];
    targetDays.forEach((day) => {
      updateDay(day, {
        openTime: source.openTime,
        closeTime: source.closeTime,
        isClosed: source.isClosed,
      });
    });
  };

  const copyToWeekdays = () => {
    // Copy Sunday's hours to Sunday-Thursday (0-4)
    copyToDays(0, [1, 2, 3, 4]);
  };

  const copyToAll = () => {
    const firstOpenDay = DAYS_OF_WEEK.find(
      (day) => !localValues[day.value].isClosed,
    );
    if (firstOpenDay) {
      copyToDays(firstOpenDay.value, [0, 1, 2, 3, 4, 5, 6]);
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      setState({ success: false, message: "" });

      const hours: DayHoursInput[] = Object.values(localValues);
      const input = { truckId, hours };

      const result = await setTruckHours(input);

      setState({
        success: result.success ?? false,
        message: result.success
          ? "שעות פעילות נשמרו"
          : (result.message ?? "שגיאה"),
      });

      if (result.success && onSuccess) {
        onSuccess();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-semibold">שעות פעילות</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyToWeekdays}
          >
            <Copy className="h-4 w-4" />
            העתק לימות השבוע
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={copyToAll}>
            <Copy className="h-4 w-4" />
            העתק לכל הימים
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {DAYS_OF_WEEK.map((day) => {
          const values = localValues[day.value];
          return (
            <div key={day.value} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{day.nameHe}</span>
                <Switch
                  checked={!values.isClosed}
                  onCheckedChange={(checked) =>
                    updateDay(day.value, { isClosed: !checked })
                  }
                />
              </div>

              {!values.isClosed && (
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="time"
                    value={values.openTime ?? ""}
                    onChange={(e) =>
                      updateDay(day.value, { openTime: e.target.value })
                    }
                    className="h-9 flex-1 min-w-0"
                  />
                  <span className="text-xs text-muted-foreground shrink-0">
                    עד
                  </span>
                  <Input
                    type="time"
                    value={values.closeTime ?? ""}
                    onChange={(e) =>
                      updateDay(day.value, { closeTime: e.target.value })
                    }
                    className="h-9 flex-1 min-w-0"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          שמור שעות פעילות
        </Button>

        {state.message && (
          <span
            className={cn(
              "text-sm",
              state.success ? "text-success" : "text-destructive",
            )}
          >
            {state.message}
          </span>
        )}
      </div>
    </div>
  );
}
