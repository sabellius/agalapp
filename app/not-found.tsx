import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h1 className="mt-4 text-2xl font-bold">העמוד לא נמצא</h1>
      <p className="mt-2 text-muted-foreground">
        העמוד שחיפשת אינו קיים או הוסר.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">חזרה לדף הבית</Link>
      </Button>
    </div>
  );
}
