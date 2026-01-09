import { prisma } from "@/lib/prisma";
import { TruckPreview } from "@/components/trucks/truck-preview";

async function getTrucks() {
  const trucks = await prisma.coffeeTruck.findMany({
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate average rating for each truck
  const trucksWithRating = await Promise.all(
    trucks.map(async (truck) => {
      const reviews = await prisma.review.findMany({
        where: { truckId: truck.id },
        select: { rating: true },
      });

      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      return {
        ...truck,
        avgRating,
      };
    })
  );

  return trucksWithRating;
}

export default async function TrucksPage() {
  const trucks = await getTrucks();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">עגלות קפה</h1>
        <p className="text-muted-foreground">
          גלה את עגלות הקפה הטובות ביותר בישראל
        </p>
      </div>

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
