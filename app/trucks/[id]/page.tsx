import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

async function getTruck(id: string) {
  const truck = await prisma.coffeeTruck.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      owner: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!truck) {
    return null;
  }

  const avgRating =
    truck.reviews.length > 0
      ? truck.reviews.reduce((sum, r) => sum + r.rating, 0) /
        truck.reviews.length
      : 0;

  return {
    ...truck,
    avgRating,
  };
}

export default async function TruckPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const truck = await getTruck(id);

  if (!truck) {
    notFound();
  }

  const primaryImage =
    truck.images.find((img) => img.isPrimary) || truck.images[0];
  const otherImages = truck.images.filter((img) => !img.isPrimary);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/trucks" className="inline-block mb-6">
        <Button variant="ghost">חזור</Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {primaryImage && (
                <div className="relative h-96 w-full bg-muted">
                  <img
                    src={primaryImage.url}
                    alt={truck.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              {otherImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 p-2">
                  {otherImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative h-24 w-full bg-muted"
                    >
                      <img
                        src={image.url}
                        alt={image.alt || truck.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>ביקורות ({truck.reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {truck.reviews.length === 0 ? (
                <p className="text-muted-foreground">אין עדיין ביקורות</p>
              ) : (
                <div className="space-y-4">
                  {truck.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b pb-4 last:border-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {review.user.image && (
                            <img
                              src={review.user.image}
                              alt={review.user.name}
                              className="h-8 w-8 rounded-full"
                            />
                          )}
                          <span className="font-medium">
                            {review.user.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {review.content}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{truck.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold">
                  {truck.avgRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({truck.reviews.length} ביקורות)
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{truck.city}</p>
                    <p className="text-sm text-muted-foreground">
                      {truck.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">בבעלות</p>
                <p className="font-medium">{truck.owner.name}</p>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full" size="lg">
                  כתוב ביקורת
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
