import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StarRating } from "./star-rating";

describe("StarRating", () => {
  it("renders 5 stars by default", () => {
    render(<StarRating rating={3} />);

    expect(
      screen.getByRole("img", { name: /3\.0 out of 5/ }),
    ).toBeInTheDocument();
  });

  it("displays rating value by default", () => {
    render(<StarRating rating={4.5} />);

    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("hides rating value when showValue is false", () => {
    render(<StarRating rating={4.5} showValue={false} />);

    expect(screen.queryByText("4.5")).not.toBeInTheDocument();
  });

  it("displays review count when provided", () => {
    render(<StarRating rating={4} reviewCount={23} />);

    expect(screen.getByText("(23)")).toBeInTheDocument();
  });

  it("does not display review count when not provided", () => {
    render(<StarRating rating={4} />);

    expect(screen.queryByText(/^\(\d+\)$/)).not.toBeInTheDocument();
  });

  it("clamps rating to minimum 0", () => {
    render(<StarRating rating={-5} />);

    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("clamps rating to maximum", () => {
    render(<StarRating rating={10} />);

    expect(screen.getByText("5.0")).toBeInTheDocument();
  });

  it("supports custom maxRating", () => {
    render(<StarRating rating={3} maxRating={10} />);

    expect(
      screen.getByRole("img", { name: /3\.0 out of 10/ }),
    ).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StarRating rating={3} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies size classes correctly", () => {
    const { container, rerender } = render(<StarRating rating={3} size="sm" />);
    expect(container.querySelector("svg")).toHaveClass("h-3", "w-3");

    rerender(<StarRating rating={3} size="md" />);
    expect(container.querySelector("svg")).toHaveClass("h-4", "w-4");

    rerender(<StarRating rating={3} size="lg" />);
    expect(container.querySelector("svg")).toHaveClass("h-5", "w-5");
  });

  it("handles zero rating", () => {
    render(<StarRating rating={0} />);

    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("handles partial ratings", () => {
    render(<StarRating rating={3.7} />);

    expect(screen.getByText("3.7")).toBeInTheDocument();
  });
});
