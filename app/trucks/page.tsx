import { TruckPreview } from "@/components/trucks/truck-preview";
import { prisma } from "@/lib/prisma";

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

  // Calculate average rating for each truck from included reviews
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
