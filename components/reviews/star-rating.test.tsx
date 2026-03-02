import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { StarRating } from "./star-rating";

describe("StarRating", () => {
  it("renders 5 stars", () => {
    const handleChange = vi.fn();
    render(<StarRating value={0} onChange={handleChange} />);

    const stars = screen.getAllByRole("button");
    expect(stars).toHaveLength(5);
  });

  it("highlights correct number of stars", () => {
    const handleChange = vi.fn();
    render(<StarRating value={3} onChange={handleChange} readonly />);

    const stars = screen.getAllByRole("button");
    expect(stars[0]).toHaveAttribute("aria-pressed", "true");
    expect(stars[1]).toHaveAttribute("aria-pressed", "true");
    expect(stars[2]).toHaveAttribute("aria-pressed", "true");
    expect(stars[3]).toHaveAttribute("aria-pressed", "false");
    expect(stars[4]).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange when star is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<StarRating value={0} onChange={handleChange} />);

    const stars = screen.getAllByRole("button");
    await user.click(stars[2]);

    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("does not call onChange when readonly", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<StarRating value={3} onChange={handleChange} readonly />);

    const stars = screen.getAllByRole("button");
    await user.click(stars[0]);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("disables buttons when readonly", () => {
    const handleChange = vi.fn();
    render(<StarRating value={3} onChange={handleChange} readonly />);

    const stars = screen.getAllByRole("button");
    stars.forEach((star) => {
      expect(star).toBeDisabled();
    });
  });

  it("has correct aria-labels", () => {
    const handleChange = vi.fn();
    render(<StarRating value={0} onChange={handleChange} />);

    expect(screen.getByLabelText("דרג 1 כוכבים")).toBeInTheDocument();
    expect(screen.getByLabelText("דרג 2 כוכבים")).toBeInTheDocument();
    expect(screen.getByLabelText("דרג 3 כוכבים")).toBeInTheDocument();
    expect(screen.getByLabelText("דרג 4 כוכבים")).toBeInTheDocument();
    expect(screen.getByLabelText("דרג 5 כוכבים")).toBeInTheDocument();
  });
});
