"use client";

import dynamic from "next/dynamic";
import type { TruckMarkerData } from "./truck-marker";

const TruckMap = dynamic(
  () => import("./truck-map").then((mod) => mod.TruckMap),
  {
    ssr: false,
  },
);

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
