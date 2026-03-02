"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { TruckMarkerData } from "./truck-marker";
import { TruckMarker } from "./truck-marker";

interface TruckMapProps {
  trucks: TruckMarkerData[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  height?: string;
}

const DEFAULT_CENTER: [number, number] = [31.5, 34.8];
const DEFAULT_ZOOM = 7;
const _ISRAEL_BOUNDS = [
  [29.3, 34.2] as [number, number],
  [33.5, 35.9] as [number, number],
];

function MapController({
  center,
  zoom,
  trucks,
}: {
  center?: [number, number];
  zoom?: number;
  trucks: TruckMarkerData[];
}) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom ?? DEFAULT_ZOOM);
    }
  }, [map, center, zoom]);

  useEffect(() => {
    if (trucks.length > 1 && !center) {
      const bounds = trucks
        .filter((t) => t.latitude !== null && t.longitude !== null)
        .map((t) => [t.latitude, t.longitude] as [number, number]);

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, trucks, center]);

  return null;
}

export function TruckMap({
  trucks,
  center,
  zoom = DEFAULT_ZOOM,
  className = "",
  height = "400px",
}: TruckMapProps) {
  const validTrucks = trucks.filter(
    (t) => t.latitude !== null && t.longitude !== null,
  );

  const mapCenter = center ?? DEFAULT_CENTER;

  return (
    <div className={className} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="z-0"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} zoom={zoom} trucks={validTrucks} />
        {validTrucks.map((truck) => (
          <TruckMarker key={truck.id} truck={truck} />
        ))}
      </MapContainer>
    </div>
  );
}
