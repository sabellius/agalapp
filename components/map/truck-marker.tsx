"use client";

import { DivIcon } from "leaflet";
import { Star } from "lucide-react";
import Link from "next/link";
import { Marker, Popup } from "react-leaflet";

export interface TruckMarkerData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  avgRating?: number;
  reviewCount?: number;
}

interface TruckMarkerProps {
  truck: TruckMarkerData;
}

function getMarkerColor(rating?: number): string {
  if (!rating) return "#6b7280";
  if (rating >= 4) return "#22c55e";
  if (rating >= 3) return "#eab308";
  if (rating >= 2) return "#f97316";
  return "#ef4444";
}

function createCustomIcon(color: string): DivIcon {
  return new DivIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export function TruckMarker({ truck }: TruckMarkerProps) {
  const color = getMarkerColor(truck.avgRating);
  const icon = createCustomIcon(color);

  return (
    <Marker position={[truck.latitude, truck.longitude]} icon={icon}>
      <Popup dir="rtl" className="truck-popup">
        <div className="text-right" style={{ minWidth: "200px" }}>
          <h3 className="font-bold text-lg mb-1">{truck.name}</h3>
          {truck.avgRating !== undefined && (
            <div className="flex items-center gap-1 mb-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {truck.avgRating.toFixed(1)}
              </span>
              {truck.reviewCount !== undefined && (
                <span className="text-xs text-muted-foreground">
                  ({truck.reviewCount})
                </span>
              )}
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-2">{truck.address}</p>
          <Link
            href={`/trucks/${truck.id}`}
            className="inline-block w-full text-center bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90"
          >
            צפה בפרטים
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}
