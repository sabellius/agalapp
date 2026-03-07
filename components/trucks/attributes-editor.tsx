"use client";

import { useState } from "react";
import { AttributeBadge } from "./attribute-badge";
import { FeatureLock } from "./feature-lock";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock } from "lucide-react";

interface AttributesEditorProps {
  truckId: string;
  availableAttributes: Array<{ id: string; name: string; nameEn: string; icon: string }>;
  assignedAttributes: Array<{ id: string; name: string; icon: string }>;
  maxAttributes: number;
  isPremium: boolean;
  onToggle: (attributeId: string, isAssigned: boolean) => Promise<{ success: boolean; message?: string }>;
}

export function AttributesEditor({
  availableAttributes,
  assignedAttributes,
  maxAttributes,
  isPremium,
  onToggle,
}: AttributesEditorProps) {
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const assignedIds = new Set(assignedAttributes.map((a) => a.id));

  const canAddMore = isPremium || assignedAttributes.length < maxAttributes;

  const handleToggle = async (attributeId: string, currentlyAssigned: boolean) => {
    setToggling(attributeId);
    setError(null);

    try {
      // If adding and not premium, check limit
      if (!currentlyAssigned && !canAddMore) {
        setError("מוגבל ל-3 מאפיינים בחינמי. שדרג לפרימיום להוספת עוד.");
        return;
      }

      const result = await onToggle(attributeId, currentlyAssigned);
      if (!result.success) {
        setError(result.message || "שגיאה בעדכון המאפיינים");
      }
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {!isPremium && (
        <FeatureLock
          title="עוד מאפיינים בפרימיום"
          description="מנוי פרימיום מאפשר להוסיף מאפיינים ללא הגבלה"
          currentCount={assignedAttributes.length}
          maxCount={maxAttributes}
        />
      )}

      <div className="flex flex-wrap gap-3">
        {availableAttributes.map((attr) => {
          const isAssigned = assignedIds.has(attr.id);
          const isToggling = toggling === attr.id;
          const showLock = !isAssigned && !canAddMore && !isPremium;

          return (
            <TooltipProvider key={attr.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => handleToggle(attr.id, isAssigned)}
                      disabled={isToggling}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                        transition-colors cursor-pointer select-none
                        ${
                          isAssigned
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }
                        ${isToggling ? "opacity-50" : ""}
                        ${showLock ? "pr-8" : ""}
                      `}
                    >
                      <span className="font-medium">{attr.name}</span>
                    </button>
                    {showLock && (
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                {showLock && (
                  <TooltipContent>
                    <p>זמין בפרימיום בלבד</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        {isPremium ? (
          <span>ללא הגבלה (פרימיום)</span>
        ) : (
          <span>
            {assignedAttributes.length} מ-{maxAttributes} מאפיינים
          </span>
        )}
      </p>
    </div>
  );
}
