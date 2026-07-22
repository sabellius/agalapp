import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { OpenStatusBadge } from "@/components/trucks/open-status-badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import type { CoffeeTruck, TruckHours } from "@/generated/prisma/client";

interface TruckPreviewProps {
  truck: CoffeeTruck & {
    images: { id: string; url: string; isPrimary: boolean }[];
    hours?: TruckHours[];
    _count: {
      reviews: number;
    };
    averageRating: number;
  };
}

export function TruckPreview({ truck }: TruckPreviewProps) {
  const primaryImage =
    truck.images.find((img) => img.isPrimary) || truck.images[0];
  const rating = truck.averageRating || 0;

  return (
    <Card className="group overflow-hidden pt-0 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <Link href={`/trucks/${truck.id}`}>
        <CardHeader className="p-0">
          {primaryImage && (
            <div className="relative h-48 w-full bg-muted overflow-hidden">
              <Image
                src={primaryImage.url}
                alt={truck.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {truck.hours && truck.hours.length > 0 && (
                <div className="absolute top-3 end-3">
                  <OpenStatusBadge hours={truck.hours} />
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold line-clamp-1 mb-2">
            {truck.name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4" />
            <span>{truck.city}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {truck.address}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <StarRating rating={rating} reviewCount={truck._count.reviews} />
          <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
            צפה בפרטים
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
