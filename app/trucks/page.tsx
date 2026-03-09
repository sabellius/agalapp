import { Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { TruckPreview } from "@/components/trucks/truck-preview";
import { TrucksSearch } from "@/components/trucks/trucks-search";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

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

  const where: {
    AND?: Array<
      | { name: { contains: string; mode: "insensitive" } }
      | { address: { contains: string; mode: "insensitive" } }
      | { city: string }
      | { reviews: { some: Record<string, never> } }
    >;
  } = {};

  const conditions = [];

  if (search?.trim()) {
    const mode = "insensitive" as const;
    conditions.push({
      OR: [
        { name: { contains: search, mode } },
        { address: { contains: search, mode } },
      ],
    });
  }

  if (normalizedCity?.trim()) {
    conditions.push({ city: normalizedCity });
  }

  if (conditions.length > 0) {
    where.AND = conditions as typeof where.AND;
  }

  const trucks = await prisma.coffeeTruck.findMany({
    where,
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
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
    const avgRating =
      truck.reviews.length > 0
        ? truck.reviews.reduce((sum, r) => sum + r.rating, 0) /
          truck.reviews.length
        : 0;

    return {
      ...truck,
      avgRating,
      reviews: undefined,
    };
  });

  const minRatingNum = minRating ? Number.parseFloat(minRating) : 0;
  const filtered =
    minRatingNum > 0
      ? trucksWithRating.filter((t) => t.avgRating >= minRatingNum)
      : trucksWithRating;

  return filtered;
}

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
        <div className="text-center py-12">
          <p className="text-muted-foreground">לא נמצאו עגלות קפה</p>
        </div>
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
