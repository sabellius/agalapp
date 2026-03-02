import Link from "next/link";
import { TruckMap } from "@/components/map/truck-map";
import { prisma } from "@/lib/prisma";

async function getTrucksWithCoords() {
  const trucks = await prisma.coffeeTruck.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
    include: {
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
  });

  return trucks
    .map((truck) => {
      const avgRating =
        truck.reviews.length > 0
          ? truck.reviews.reduce((sum, r) => sum + r.rating, 0) /
            truck.reviews.length
          : 0;

      return {
        id: truck.id,
        name: truck.name,
        address: truck.address,
        latitude: truck.latitude as number,
        longitude: truck.longitude as number,
        avgRating,
        reviewCount: truck._count.reviews,
      };
    })
    .filter((t) => t.latitude !== null && t.longitude !== null);
}

export default async function TruckMapPage() {
  const trucks = await getTrucksWithCoords();

  return (
    <div className="h-screen flex flex-col">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">מפת עגלות הקפה</h1>
          <p className="text-sm text-muted-foreground">
            {trucks.length} עגלות עם מיקום
          </p>
        </div>
        <Link href="/trucks">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            חזור לרשימה
          </button>
        </Link>
      </div>

      <div className="flex-1 relative">
        <TruckMap
          trucks={trucks}
          height="100%"
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}
