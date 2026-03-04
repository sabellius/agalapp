"use client";

import { ThumbsUp } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleVote } from "@/app/actions/votes";
import { Button } from "@/components/ui/button";

interface VoteButtonProps {
  reviewId: string;
  initialVoteCount: number;
  initialHasVoted: boolean;
  isOwner: boolean;
}

export function VoteButton({
  reviewId,
  initialVoteCount,
  initialHasVoted,
  isOwner,
}: VoteButtonProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isPending, startTransition] = useTransition();

  const handleVote = () => {
    startTransition(async () => {
      const result = await toggleVote({ reviewId });

      if (result.success && result.data) {
        setHasVoted(result.data.voted);
        setVoteCount(result.data.voteCount);
      }
    });
  };

  if (isOwner) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <ThumbsUp className="h-4 w-4" />
        <span className="text-xs">{voteCount}</span>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 gap-1 px-2 ${hasVoted ? "text-primary" : "text-muted-foreground"}`}
      onClick={handleVote}
      disabled={isPending}
    >
      <ThumbsUp className={`h-4 w-4 ${hasVoted ? "fill-current" : ""}`} />
      <span className="text-xs">{voteCount}</span>
    </Button>
  );
}
