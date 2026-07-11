import { Calendar, MapPin, MessageSquareOff, Star } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TruckMapClient } from "@/components/map/truck-map-client";
import { ReviewActions } from "@/components/reviews/review-actions";
import { ReviewForm } from "@/components/reviews/review-form";
import { VoteButton } from "@/components/reviews/vote-button";
import { AttributesGrid } from "@/components/trucks/attributes-grid";
import { HoursDisplay } from "@/components/trucks/hours-display";
import { OpenStatusBadge } from "@/components/trucks/open-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canModifyTruck, canShowWorkingHours } from "@/lib/truck-permissions";
import { calculateAverageRating } from "@/lib/truck-utils";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const truck = await prisma.coffeeTruck.findUnique({
    where: { id },
    select: {
      name: true,
      city: true,
      address: true,
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      reviews: {
        select: { rating: true },
      },
    },
  });

  if (!truck) {
    return { title: "עגלת קפה לא נמצאה | AgalApp" };
  }

  const averageRating = calculateAverageRating(truck.reviews);
  const ratingText = averageRating > 0 ? `${averageRating.toFixed(1)} ⭐` : "";
  const primaryImage = truck.images[0];

  return {
    title: `${truck.name} | AgalApp`,
    description: `${truck.name} - עגלת קפה ב${truck.city}, ${truck.address}${ratingText ? ` · ${ratingText}` : ""}`,
    openGraph: {
      title: truck.name,
      description: `עגלת קפה ב${truck.city}`,
      images: primaryImage ? [{ url: primaryImage.url, alt: truck.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: truck.name,
      description: `עגלת קפה ב${truck.city}`,
      images: primaryImage ? [primaryImage.url] : [],
    },
  };
}

async function getTruck(id: string, userId?: string) {
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
          votes: userId
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
          _count: {
            select: { votes: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      owner: {
        select: {
          name: true,
          role: true,
          tier: true,
          tierExpiryAt: true,
        },
      },
      hours: {
        orderBy: { dayOfWeek: "asc" },
      },
      attributes: {
        include: {
          attribute: {
            select: {
              name: true,
              icon: true,
            },
          },
        },
      },
    },
  });

  if (!truck) {
    return null;
  }

  const averageRating = calculateAverageRating(truck.reviews);

  return {
    ...truck,
    averageRating,
  };
}

export default async function TruckPage({ params }: Props) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const truck = await getTruck(id, session?.user?.id);

  if (!truck) {
    notFound();
  }

  const hasReviewed = session?.user?.id
    ? truck.reviews.some((review) => review.userId === session.user.id)
    : false;
  const canShowHours = canShowWorkingHours(truck.owner);
  const canEdit = session?.user?.id
    ? await canModifyTruck(session.user.id, truck.ownerId)
    : false;

  const primaryImage =
    truck.images.find((img) => img.isPrimary) || truck.images[0];
  const otherImages = truck.images.filter((img) => !img.isPrimary);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/trucks" className="inline-block mb-6">
        <Button variant="ghost">חזור</Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: truck identity, hours, attributes */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-2xl">{truck.name}</CardTitle>
                <OpenStatusBadge hours={truck.hours} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold">
                  {truck.averageRating.toFixed(1)}
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
                {!session?.user ? (
                  <Link href="/auth/sign-in" className="w-full">
                    <Button className="w-full" size="lg" variant="outline">
                      התחבר כדי לכתוב ביקורת
                    </Button>
                  </Link>
                ) : hasReviewed ? (
                  <Button
                    className="w-full"
                    size="lg"
                    variant="outline"
                    disabled
                  >
                    כבר כתבת ביקורת על עגלה זו
                  </Button>
                ) : (
                  <ReviewForm truckId={id}>
                    <Button className="w-full" size="lg">
                      כתוב ביקורת
                    </Button>
                  </ReviewForm>
                )}
              </div>

              {canEdit && (
                <div className="pt-4 border-t">
                  <Link href={`/trucks/${id}/edit`} className="w-full">
                    <Button size="lg" variant="outline" className="w-full">
                      עריכת עגלה
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {canShowHours && truck.hours.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <HoursDisplay hours={truck.hours} />
              </CardContent>
            </Card>
          )}

          {truck.attributes.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-3">מאפיינים</h3>
                <AttributesGrid
                  attributes={truck.attributes.map((a) => a.attribute)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content: images, map, reviews */}
        <div className="lg:col-span-2 space-y-6">
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

          {truck.latitude && truck.longitude && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  מיקום
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TruckMapClient
                  trucks={[
                    {
                      id: truck.id,
                      name: truck.name,
                      address: truck.address,
                      latitude: truck.latitude,
                      longitude: truck.longitude,
                      averageRating: truck.averageRating,
                      reviewCount: truck.reviews.length,
                    },
                  ]}
                  height="350px"
                  center={
                    truck.latitude && truck.longitude
                      ? [truck.latitude, truck.longitude]
                      : undefined
                  }
                  zoom={15}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>ביקורות ({truck.reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {truck.reviews.length === 0 ? (
                <EmptyState
                  icon={MessageSquareOff}
                  title="אין עדיין ביקורות"
                  description="היה הראשון לכתוב ביקורת על עגלת הקפה הזו"
                />
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
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{review.rating}</span>
                          </div>
                          <ReviewActions
                            reviewId={review.id}
                            review={{
                              id: review.id,
                              rating: review.rating,
                              content: review.content,
                            }}
                            truckId={id}
                            isOwner={session?.user?.id === review.userId}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {review.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                        <VoteButton
                          reviewId={review.id}
                          initialVoteCount={review._count.votes}
                          initialHasVoted={
                            session?.user?.id
                              ? (review.votes as { id: string }[]).length > 0
                              : false
                          }
                          isOwner={session?.user?.id === review.userId}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
