"use client";

import { TruckMap } from "./truck-map";
import type { TruckMarkerData } from "./truck-marker";

interface TruckMapClientProps {
  trucks: TruckMarkerData[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  height?: string;
}

export function TruckMapClient(props: TruckMapClientProps) {
  return <TruckMap {...props} />;
}
