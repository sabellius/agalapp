import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-3xl font-bold mb-6">
        מוכן לגלות את עגלות הקפה הטובות בישראל?
      </h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        גלה עגלות קפה מובילות, קרא ביקורות, ומצא את הקפה המושלם שלך על גלגלים!
      </p>
      <Link href="/trucks">
        <Button size="lg" className="text-lg">
          לכל העגלות
        </Button>
      </Link>
    </section>
  );
}
