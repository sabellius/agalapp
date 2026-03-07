import { Clock } from "lucide-react";
import type { TruckHours } from "@/generated/prisma/client";
import { DAYS_OF_WEEK } from "@/lib/truck-hours";

interface HoursDisplayProps {
  hours: TruckHours[];
}

export function HoursDisplay({ hours }: HoursDisplayProps) {
  // Convert to array format
  const weeklyHours = DAYS_OF_WEEK.map((day) => {
    const hoursRecord = hours.find((h) => h.dayOfWeek === day.value);
    return {
      dayOfWeek: day.value as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      nameHe: day.nameHe,
      openTime: hoursRecord?.openTime ?? null,
      closeTime: hoursRecord?.closeTime ?? null,
      isClosed: hoursRecord?.isClosed ?? true,
    };
  });

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <Clock className="h-5 w-5" />
        שעות פעילות
      </h3>
      <div className="space-y-1.5 text-sm">
        {weeklyHours.map((dayHours) => (
          <div key={dayHours.dayOfWeek} className="flex justify-between">
            <span className="font-medium text-muted-foreground">
              {dayHours.nameHe}:
            </span>
            <span>
              {dayHours.isClosed || !dayHours.openTime
                ? "סגור"
                : `${dayHours.openTime}-${dayHours.closeTime}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
