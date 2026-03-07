import type { LucideIcon } from "lucide-react";
import * as icons from "lucide-react";

const iconMap: Record<string, LucideIcon> = icons;

interface AttributeBadgeProps {
  name: string;
  icon: string;
}

export function AttributeBadge({ name, icon }: AttributeBadgeProps) {
  const IconComponent = iconMap[icon] || icons.Tag;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
      <IconComponent className="h-3.5 w-3.5" />
      <span>{name}</span>
    </div>
  );
}
