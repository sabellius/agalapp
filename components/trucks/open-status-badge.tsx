import { Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TruckHours } from "@/generated/prisma/client";
import { getIsraelTime } from "@/lib/truck-hours";

interface OpenStatusBadgeProps {
  hours: TruckHours[];
}

export function OpenStatusBadge({ hours }: OpenStatusBadgeProps) {
  if (hours.length === 0) {
    return null;
  }

  const now = getIsraelTime();
  const currentDay = now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayHours = hours.find((h) => h.dayOfWeek === currentDay);

  if (
    !todayHours ||
    todayHours.isClosed ||
    !todayHours.openTime ||
    !todayHours.closeTime
  ) {
    return (
      <Badge
        variant="outline"
        className="gap-1 bg-background/90 text-foreground border-border shadow-md backdrop-blur-sm"
      >
        <Circle className="h-2 w-2 fill-muted-foreground text-muted-foreground" />
        סגור
      </Badge>
    );
  }

  const [openHour, openMin] = todayHours.openTime.split(":").map(Number);
  const [closeHour, closeMin] = todayHours.closeTime.split(":").map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  if (isOpen) {
    return (
      <Badge
        variant="default"
        className="gap-1 bg-success text-white shadow-md"
      >
        <Circle className="h-2 w-2 fill-white text-white" />
        פתוח
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1 bg-background/90 text-foreground border-border shadow-md backdrop-blur-sm"
    >
      <Circle className="h-2 w-2 fill-muted-foreground text-muted-foreground" />
      סגור
    </Badge>
  );
}
