import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TruckMarker, type TruckMarkerData } from "./truck-marker";

vi.mock("react-leaflet", () => ({
  Marker: ({ children, position }: any) => (
    <div data-testid="marker" data-position={position.join(",")}>
      {children}
    </div>
  ),
  Popup: ({ children, dir }: any) => (
    <div data-testid="popup" data-dir={dir}>
      {children}
    </div>
  ),
  useMap: () => ({}),
}));

describe("TruckMarker", () => {
  const mockTruck: TruckMarkerData = {
    id: "1",
    name: "Test Truck",
    address: "Test Street, Tel Aviv",
    latitude: 32.0853,
    longitude: 34.7818,
    avgRating: 4.5,
    reviewCount: 10,
  };

  it("renders marker with correct position", () => {
    render(<TruckMarker truck={mockTruck} />);

    const marker = screen.getByTestId("marker");
    expect(marker).toHaveAttribute("data-position", "32.0853,34.7818");
  });

  it("renders popup with truck name", () => {
    render(<TruckMarker truck={mockTruck} />);

    expect(screen.getByText("Test Truck")).toBeInTheDocument();
  });

  it("renders popup with truck address", () => {
    render(<TruckMarker truck={mockTruck} />);

    expect(screen.getByText("Test Street, Tel Aviv")).toBeInTheDocument();
  });

  it("renders rating when available", () => {
    render(<TruckMarker truck={mockTruck} />);

    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders review count when available", () => {
    render(<TruckMarker truck={mockTruck} />);

    expect(screen.getByText("(10)")).toBeInTheDocument();
  });

  it("renders popup with RTL direction", () => {
    render(<TruckMarker truck={mockTruck} />);

    const popup = screen.getByTestId("popup");
    expect(popup).toHaveAttribute("data-dir", "rtl");
  });

  it("renders link to truck detail", () => {
    render(<TruckMarker truck={mockTruck} />);

    const link = screen.getByRole("link", { name: /צפה בפרטים/ });
    expect(link).toHaveAttribute("href", "/trucks/1");
  });

  it("renders without rating when not available", () => {
    const truckWithoutRating: TruckMarkerData = {
      ...mockTruck,
      avgRating: undefined,
      reviewCount: undefined,
    };

    render(<TruckMarker truck={truckWithoutRating} />);

    expect(screen.queryByText("4.5")).not.toBeInTheDocument();
  });
});
