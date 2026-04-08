"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">משהו השתבש</h1>
      <p className="mt-2 text-muted-foreground">
        אירעה שגיאה בלתי צפויה. נסה שנית.
      </p>
      <Button onClick={reset} className="mt-6">
        נסה שנית
      </Button>
    </div>
  );
}
