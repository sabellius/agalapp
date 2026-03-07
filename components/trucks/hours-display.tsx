import { Clock } from "lucide-react";
import type { TruckHours } from "@/generated/prisma/client";
import { DAYS_OF_WEEK, groupHoursForDisplay } from "@/lib/truck-hours";

interface HoursDisplayProps {
  hours: TruckHours[];
}

export function HoursDisplay({ hours }: HoursDisplayProps) {
  // Convert to array format
  const weeklyHours = DAYS_OF_WEEK.map((day) => {
    const hoursRecord = hours.find((h) => h.dayOfWeek === day.value);
    return {
      dayOfWeek: day.value as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      openTime: hoursRecord?.openTime ?? null,
      closeTime: hoursRecord?.closeTime ?? null,
      isClosed: hoursRecord?.isClosed ?? true,
    };
  });

  const grouped = groupHoursForDisplay(weeklyHours);

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <Clock className="h-5 w-5" />
        שעות פעילות
      </h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {grouped.map((group, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="font-medium text-muted-foreground">
              {group.days}:
            </span>
            <span>{group.hours}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
