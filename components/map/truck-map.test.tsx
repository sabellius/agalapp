import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TruckMap } from "./truck-map";
import type { TruckMarkerData } from "./truck-marker";

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, className, style }: any) => (
    <div
      className={`leaflet-map ${className || ""}`}
      style={style || {}}
      data-testid="map-container"
    >
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  useMap: () => ({
    setView: vi.fn(),
    fitBounds: vi.fn(),
  }),
}));

vi.mock("./truck-marker", () => ({
  TruckMarker: ({ truck }: { truck: TruckMarkerData }) => (
    <div data-testid={`marker-${truck.id}`}>
      {truck.name} - {truck.latitude}, {truck.longitude}
    </div>
  ),
}));

describe("TruckMap", () => {
  const mockTrucks: TruckMarkerData[] = [
    {
      id: "1",
      name: "Coffee Truck 1",
      address: "Tel Aviv",
      latitude: 32.0853,
      longitude: 34.7818,
      avgRating: 4.5,
      reviewCount: 10,
    },
    {
      id: "2",
      name: "Coffee Truck 2",
      address: "Jerusalem",
      latitude: 31.7683,
      longitude: 35.2137,
      avgRating: 3.5,
      reviewCount: 5,
    },
  ];

  it("renders map container", () => {
    render(<TruckMap trucks={mockTrucks} />);

    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("renders tile layer", () => {
    render(<TruckMap trucks={mockTrucks} />);

    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
  });

  it("renders markers for trucks with coordinates", () => {
    render(<TruckMap trucks={mockTrucks} />);

    expect(screen.getByTestId("marker-1")).toBeInTheDocument();
    expect(screen.getByTestId("marker-2")).toBeInTheDocument();
  });

  it("filters out trucks without coordinates", () => {
    const trucksWithNulls: TruckMarkerData[] = [
      ...mockTrucks,
      {
        id: "3",
        name: "No Coords",
        address: "Unknown",
        latitude: null as any,
        longitude: null as any,
      },
    ];

    render(<TruckMap trucks={trucksWithNulls} />);

    expect(screen.getByTestId("marker-1")).toBeInTheDocument();
    expect(screen.getByTestId("marker-2")).toBeInTheDocument();
    expect(screen.queryByTestId("marker-3")).not.toBeInTheDocument();
  });

  it("renders empty map when no trucks have coordinates", () => {
    render(<TruckMap trucks={[]} />);

    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    expect(screen.queryByTestId("marker-1")).not.toBeInTheDocument();
  });

  it("accepts custom height prop without error", () => {
    expect(() =>
      render(<TruckMap trucks={mockTrucks} height="500px" />)
    ).not.toThrow();
  });

  it("accepts custom className prop without error", () => {
    expect(() =>
      render(<TruckMap trucks={mockTrucks} className="custom" />)
    ).not.toThrow();
  });
});
