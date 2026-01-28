"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { deleteReview } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReviewForm } from "./review-form";

interface ReviewActionsProps {
  reviewId: string;
  review: {
    id: string;
    rating: number;
    content: string;
  };
  truckId: string;
  isOwner: boolean;
}

export function ReviewActions({
  reviewId,
  review,
  truckId,
  isOwner,
}: ReviewActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteReview(reviewId);
    setIsDeleting(false);

    if (result.success) {
      setDeleteDialogOpen(false);
      window.location.reload();
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        <ReviewForm truckId={truckId} review={review}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
        </ReviewForm>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחיקת ביקורת</DialogTitle>
            <DialogDescription>
              האם למחוק את הביקורת? פעולה זו אינה הפיכה.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "מוחק..." : "מחק"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
