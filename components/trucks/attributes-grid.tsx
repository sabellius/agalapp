import { AttributeBadge } from "./attribute-badge";

interface AttributesGridProps {
  attributes: Array<{ name: string; icon: string }>;
  emptyMessage?: string;
}

export function AttributesGrid({
  attributes,
  emptyMessage = "אין מאפיינים",
}: AttributesGridProps) {
  if (attributes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {attributes.map((attr) => (
        <AttributeBadge key={attr.name} name={attr.name} icon={attr.icon} />
      ))}
    </div>
  );
}
