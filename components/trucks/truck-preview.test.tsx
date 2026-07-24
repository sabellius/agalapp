import { render, screen } from "@testing-library/react";
import type { TruckHours } from "@/generated/prisma/client";
import { TruckPreview } from "./truck-preview";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

vi.mock("./open-status-badge", () => ({
  OpenStatusBadge: ({ hours }: { hours: TruckHours[] }) => (
    <div data-testid="open-status-badge" data-hours-count={hours.length}>
      Badge
    </div>
  ),
}));

function createMockHour(overrides?: Partial<TruckHours>): TruckHours {
  return {
    id: "hour-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    truckId: "truck-1",
    dayOfWeek: 0,
    openTime: "08:00",
    closeTime: "16:00",
    isClosed: false,
    ...overrides,
  };
}

describe("TruckPreview", () => {
  const mockTruck = {
    id: "truck-1",
    name: "עגלת הקפה",
    city: "תל אביב",
    address: "רוטשילד 1",
    description: "קפה מעולה",
    ownerId: "owner-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    latitude: 32.0853 as number | null,
    longitude: 34.7818 as number | null,
    images: [
      { id: "img-1", url: "https://example.com/image.jpg", isPrimary: true },
    ],
    hours: [createMockHour()],
    _count: { reviews: 5 },
    averageRating: 4.5,
  };

  it("renders truck information", () => {
    render(<TruckPreview truck={mockTruck} />);

    expect(screen.getByText("עגלת הקפה")).toBeInTheDocument();
    expect(screen.getByText("תל אביב")).toBeInTheDocument();
    expect(screen.queryByText("רוטשילד 1")).not.toBeInTheDocument();
  });

  it("displays average rating", () => {
    render(<TruckPreview truck={mockTruck} />);

    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("(5)")).toBeInTheDocument();
  });

  it("shows zero rating when no reviews", () => {
    const truckNoReviews = {
      ...mockTruck,
      _count: { reviews: 0 },
      averageRating: 0,
    };

    render(<TruckPreview truck={truckNoReviews} />);

    expect(screen.getByText("0.0")).toBeInTheDocument();
    expect(screen.getByText("(0)")).toBeInTheDocument();
  });

  it("shows view details button", () => {
    render(<TruckPreview truck={mockTruck} />);

    expect(
      screen.getByRole("link", { name: /צפה בפרטים/ }),
    ).toBeInTheDocument();
  });

  it("links to truck detail page", () => {
    render(<TruckPreview truck={mockTruck} />);

    const link = screen.getByRole("link", { name: /עגלת הקפה/ });
    expect(link).toHaveAttribute("href", "/trucks/truck-1");
  });

  it("uses primary image when available", () => {
    render(<TruckPreview truck={mockTruck} />);

    const image = screen.getByRole("img", { name: "עגלת הקפה" });
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("falls back to first image when no primary image", () => {
    const truckNoPrimary = {
      ...mockTruck,
      images: [
        {
          id: "img-1",
          url: "https://example.com/image1.jpg",
          isPrimary: false,
        },
        {
          id: "img-2",
          url: "https://example.com/image2.jpg",
          isPrimary: false,
        },
      ],
    };

    render(<TruckPreview truck={truckNoPrimary} />);

    const image = screen.getByRole("img", { name: "עגלת הקפה" });
    expect(image).toHaveAttribute("src", "https://example.com/image1.jpg");
  });

  it("renders without image when images array is empty", () => {
    const truckNoImages = { ...mockTruck, images: [] };

    render(<TruckPreview truck={truckNoImages} />);

    // Should still render the truck info, just without an image
    expect(screen.getByText("עגלת הקפה")).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "עגלת הקפה" }),
    ).not.toBeInTheDocument();
  });

  it("shows open status badge when hours exist", () => {
    render(<TruckPreview truck={mockTruck} />);

    const badge = screen.getByTestId("open-status-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-hours-count", "1");
  });

  it("does not show open status badge when hours array is empty", () => {
    const truckNoHours = { ...mockTruck, hours: [] };

    render(<TruckPreview truck={truckNoHours} />);

    expect(screen.queryByTestId("open-status-badge")).not.toBeInTheDocument();
  });

  it("does not show open status badge when hours is undefined", () => {
    const truckUndefinedHours = { ...mockTruck, hours: undefined };

    render(<TruckPreview truck={truckUndefinedHours} />);

    expect(screen.queryByTestId("open-status-badge")).not.toBeInTheDocument();
  });
});
