import { Map as MapIcon, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { TruckPreview } from "@/components/trucks/truck-preview";
import { TrucksSearch } from "@/components/trucks/trucks-search";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { prisma } from "@/lib/prisma";
import { calculateAverageRating } from "@/lib/truck-utils";

interface SearchParams {
  search?: string;
  city?: string;
  minRating?: string;
}

interface TrucksPageProps {
  searchParams: Promise<SearchParams>;
}

async function getTrucks(params: SearchParams) {
  const { search, city, minRating } = params;

  const normalizedCity = city === "all" ? undefined : city;

  const conditions = [];

  if (search?.trim()) {
    conditions.push({
      OR: [{ name: { contains: search } }, { address: { contains: search } }],
    });
  }

  if (normalizedCity?.trim()) {
    conditions.push({ city: normalizedCity });
  }

  const where = conditions.length > 0 ? { AND: conditions } : {};

  const trucks = await prisma.coffeeTruck.findMany({
    where,
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
      hours: true,
      _count: {
        select: {
          reviews: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const trucksWithRating = trucks.map((truck) => {
    const averageRating = calculateAverageRating(truck.reviews);

    return {
      ...truck,
      averageRating,
      reviews: undefined,
    };
  });

  const minRatingNum = minRating ? Number.parseFloat(minRating) : 0;
  const filtered =
    minRatingNum > 0
      ? trucksWithRating.filter((t) => t.averageRating >= minRatingNum)
      : trucksWithRating;

  return filtered;
}

export const metadata: Metadata = {
  title: "עגלות קפה | AgalApp",
  description: "גלה את עגלות הקפה הטובות ביותר בישראל. חפש לפי שם, עיר ודירוג.",
};

export default async function TrucksPage({ searchParams }: TrucksPageProps) {
  const params = await searchParams;
  const trucks = await getTrucks(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">עגלות קפה</h1>
          <p className="text-muted-foreground">
            גלה את עגלות הקפה הטובות ביותר בישראל
          </p>
        </div>
        <Link href="/trucks/map">
          <Button variant="outline" className="gap-2">
            <MapIcon className="h-4 w-4" />
            מפה
          </Button>
        </Link>
      </div>

      <TrucksSearch />

      {trucks.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="לא נמצאו עגלות קפה"
          description="נסה לחפש עם מילות חיפוש אחרות או לשנות את המסננים"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trucks.map((truck) => (
            <TruckPreview key={truck.id} truck={truck} />
          ))}
        </div>
      )}
    </div>
  );
}
