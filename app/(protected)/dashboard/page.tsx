import { Coffee, MapPin, Pencil, Plus, Star } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAverageRating } from "@/lib/truck-utils";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const isOwner = dbUser?.role === "TRUCK_OWNER";
  const isAdmin = dbUser?.role === "ADMIN";
  const isOwnerOrAdmin = isOwner || isAdmin;

  const trucks = isOwnerOrAdmin
    ? await prisma.coffeeTruck.findMany({
        where: isAdmin ? {} : { ownerId: user.id },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { reviews: true } },
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { truck: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const reviewCount = await prisma.review.count({
    where: { userId: user.id },
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 md:py-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">ברוכים הבאים!</h1>
          <p className="text-muted-foreground">{user.name || user.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isOwnerOrAdmin && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{trucks.length}</p>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "עגלות במערכת" : "העגלות שלי"}
                </p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{reviewCount}</p>
              <p className="text-sm text-muted-foreground">ביקורות</p>
            </CardContent>
          </Card>
        </div>

        {isOwnerOrAdmin && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isAdmin ? "ניהול עגלות" : "העגלות שלי"}
              </h2>
              <Button size="sm" asChild>
                <Link href="/trucks/new">
                  <Plus className="h-4 w-4" />
                  הוסף עגלה
                </Link>
              </Button>
            </div>
            {trucks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  עדיין אין עגלות. הוסף את העגלה הראשונה!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {trucks.map((truck) => {
                  const avgRating = calculateAverageRating(truck.reviews);
                  return (
                    <Card key={truck.id}>
                      <CardContent className="flex items-center gap-4 py-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {truck.images[0] ? (
                            <Image
                              src={truck.images[0].url}
                              alt={truck.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Coffee className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/trucks/${truck.id}`}
                            className="font-medium hover:underline"
                          >
                            {truck.name}
                          </Link>
                          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {truck.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-star text-star" />
                              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                            </span>
                            <span>{truck._count.reviews} ביקורות</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/trucks/${truck.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            עריכה
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {reviews.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">הביקורות שלי</h2>
            <div className="space-y-3">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/trucks/${review.truckId}`}
                        className="font-medium hover:underline"
                      >
                        {review.truck.name}
                      </Link>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-star text-star" />
                        <span className="text-sm">{review.rating}</span>
                      </div>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {review.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">פרטי משתמש</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="font-medium">אימייל:</dt>
                <dd className="text-muted-foreground">{user.email}</dd>
              </div>
              {user.name && (
                <div>
                  <dt className="font-medium">שם:</dt>
                  <dd className="text-muted-foreground">{user.name}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <SignOutButton />

        <Link
          href="/"
          className="block text-center text-sm text-muted-foreground hover:underline"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
