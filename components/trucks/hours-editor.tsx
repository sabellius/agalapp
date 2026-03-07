"use client";

import { Clock, Loader2 } from "lucide-react";
import React, { useState, useTransition } from "react";
import { setTruckHours } from "@/app/actions/truck-hours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { TruckHours } from "@/generated/prisma/client";
import { DAYS_OF_WEEK } from "@/lib/truck-hours";
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

  const [localValues, setLocalValues] = useState<
    Record<number, DayHoursInput>
  >(getDefaultValues());

  const updateDay = (dayOfWeek: number, updates: Partial<DayHoursInput>) => {
    setLocalValues((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], ...updates },
    }));
  };

  const handleSubmit = () => {
    startTransition(async () => {
      setState({ success: false, message: "" });

      const hours: DayHoursInput[] = Object.values(localValues);
      const input = { truckId, hours };

      const result = await setTruckHours(input);

      setState({
        success: result.success ?? false,
        message: result.success ? "שעות פעילות נשמרו" : result.message ?? "שגיאה",
      });

      if (result.success && onSuccess) {
        onSuccess();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5" />
        <h3 className="text-lg font-semibold">שעות פעילות</h3>
      </div>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => {
          const values = localValues[day.value];
          return (
            <div key={day.value} className="flex items-center gap-4">
              <span className="w-12 text-sm font-medium">{day.shortHe}</span>
              <span className="w-16 text-sm text-muted-foreground">
                {day.nameHe}
              </span>

              <Switch
                checked={!values.isClosed}
                onCheckedChange={(checked) =>
                  updateDay(day.value, { isClosed: !checked })
                }
              />

              {!values.isClosed && (
                <>
                  <Input
                    type="time"
                    value={values.openTime ?? ""}
                    onChange={(e) =>
                      updateDay(day.value, { openTime: e.target.value })
                    }
                    className="w-32"
                  />
                  <span>עד</span>
                  <Input
                    type="time"
                    value={values.closeTime ?? ""}
                    onChange={(e) =>
                      updateDay(day.value, { closeTime: e.target.value })
                    }
                    className="w-32"
                  />
                </>
              )}
            </div>
          );
        })}

        <div className="flex items-center gap-4 pt-2">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            שמור שעות פעילות
          </Button>

          {state.message && (
            <span
              className={`text-sm ${state.success ? "text-green-600" : "text-destructive"}`}
            >
              {state.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
