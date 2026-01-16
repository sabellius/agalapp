import { Calendar, MapPin, Star } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  // Get session to check if user can edit this truck
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
                  <Image
                    src={primaryImage.url}
                    alt={truck.name}
                    fill
                    className="object-cover"
                    priority
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
                      <Image
                        src={image.url}
                        alt={image.alt || truck.name}
                        fill
                        className="object-cover"
                      />
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
                            <div className="relative h-8 w-8 rounded-full overflow-hidden">
                              <Image
                                src={review.user.image}
                                alt={review.user.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <span className="font-medium">
                            {review.user.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{truck.city}</p>
                  <p className="text-sm text-muted-foreground">
                    {truck.address}
                  </p>
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

              <div className="pt-4 border-t">
                {session?.user && (
                  <Link href={`/trucks/${id}/edit`} className="w-full">
                    <Button size="lg">עריכת עגלה</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
