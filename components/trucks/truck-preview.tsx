import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { CoffeeTruck } from "@/generated/prisma/client";

interface TruckPreviewProps {
  truck: CoffeeTruck & {
    images: { id: string; url: string; isPrimary: boolean }[];
    _count: {
      reviews: number;
    };
    avgRating: number;
  };
}

export function TruckPreview({ truck }: TruckPreviewProps) {
  const primaryImage =
    truck.images.find((img) => img.isPrimary) || truck.images[0];
  const rating = truck.avgRating || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/trucks/${truck.id}`}>
        <CardHeader className="p-0">
          {primaryImage && (
            <div className="relative h-48 w-full bg-muted">
              <Image
                src={primaryImage.url}
                alt={truck.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
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
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({truck._count.reviews})
            </span>
          </div>
          <Button variant="ghost" size="sm">
            צפה בפרטים
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
