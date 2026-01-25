"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createReview } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./star-rating";

interface ReviewFormProps {
  truckId: string;
  children: React.ReactNode;
}

export function ReviewForm({ truckId, children }: ReviewFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("יש לבחור דירוג");
      return;
    }

    if (!content.trim()) {
      setError("יש לכתוב תוכן לביקורת");
      return;
    }

    if (content.trim().length < 10) {
      setError("התוכן קצר מדי (מינימום 10 תווים)");
      return;
    }

    if (content.trim().length > 1000) {
      setError("התוכן ארוך מדי (מקסימום 1000 תווים)");
      return;
    }

    setIsSubmitting(true);

    const result = await createReview(truckId, rating, content.trim());

    setIsSubmitting(false);

    if (result.success) {
      setOpen(false);
      setRating(0);
      setContent("");
      router.refresh();
    } else {
      setError(result.message || "שגיאה ביצירת הביקורת");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            כתוב ביקורת
          </DialogTitle>
          <DialogDescription>
            שתף את דעתך על העגלה ועזור למשתמשים אחרים
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">דירוג</Label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">הביקורת שלך</Label>
            <Textarea
              id="content"
              placeholder="שתף את חוויתך עם העגלה..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {content.length} / 1000 תווים
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "שולח..." : "שלח ביקורת"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
