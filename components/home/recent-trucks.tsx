import { TruckPreview } from "@/components/trucks/truck-preview";
import { prisma } from "@/lib/prisma";
import { calculateAverageRating } from "@/lib/truck-utils";

const RECENT_TRUCKS_LIMIT = 4;

async function getRecentTrucks() {
  const trucks = await prisma.coffeeTruck.findMany({
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
      hours: true,
      reviews: {
        select: { rating: true },
      },
      _count: {
        select: { reviews: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: RECENT_TRUCKS_LIMIT,
  });

  return trucks.map((truck) => {
    const averageRating = calculateAverageRating(truck.reviews);
    return {
      ...truck,
      averageRating,
      reviews: undefined,
    };
  });
}

export async function RecentTrucks() {
  const trucks = await getRecentTrucks();

  if (trucks.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trucks.map((truck) => (
          <TruckPreview key={truck.id} truck={truck} />
        ))}
      </div>
    </section>
  );
}
