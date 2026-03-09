import { render, screen } from "@testing-library/react";
import { TruckPreview } from "./truck-preview";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

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
    images: [
      { id: "img-1", url: "https://example.com/image.jpg", isPrimary: true },
    ],
    _count: { reviews: 5 },
    avgRating: 4.5,
  };

  it("renders truck information", () => {
    render(<TruckPreview truck={mockTruck} />);

    expect(screen.getByText("עגלת הקפה")).toBeInTheDocument();
    expect(screen.getByText("תל אביב")).toBeInTheDocument();
    expect(screen.getByText("רוטשילד 1")).toBeInTheDocument();
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
      avgRating: 0,
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
});
