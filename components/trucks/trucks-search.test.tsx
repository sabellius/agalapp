import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TrucksSearch } from "./trucks-search";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key),
    toString: () => mockSearchParams.toString(),
  }),
}));

describe("TrucksSearch", () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    mockPush.mockClear();
  });

  it("renders search input and filters", () => {
    render(<TrucksSearch />);

    expect(
      screen.getByPlaceholderText(/חיפוש לפי שם או כתובת/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /חפש/ })).toBeInTheDocument();
  });

  it("updates search input on type", async () => {
    const user = userEvent.setup();
    render(<TrucksSearch />);

    const input = screen.getByPlaceholderText(/חיפוש/);
    await user.type(input, "תל אביב");

    expect(input).toHaveValue("תל אביב");
  });

  it("submits search form", async () => {
    const user = userEvent.setup();
    render(<TrucksSearch />);

    const input = screen.getByPlaceholderText(/חיפוש/);
    await user.type(input, "קפה");

    const submitButton = screen.getByRole("button", { name: /חפש/ });
    await user.click(submitButton);

    expect(mockPush).toHaveBeenCalled();
  });

  it("shows clear button when search has text", async () => {
    const user = userEvent.setup();
    render(<TrucksSearch />);

    const input = screen.getByPlaceholderText(/חיפוש/);
    await user.type(input, "test");

    const buttons = screen.getAllByRole("button");
    const iconButtons = buttons.filter((btn) => !btn.textContent);
    expect(iconButtons.length).toBeGreaterThan(0);
  });

  it("clears search when clicking X button", async () => {
    const user = userEvent.setup();
    render(<TrucksSearch />);

    const input = screen.getByPlaceholderText(/חיפוש/);
    await user.type(input, "test");

    const buttons = screen.getAllByRole("button");
    const iconButtons = buttons.filter((btn) => !btn.textContent);
    if (iconButtons[0]) {
      await user.click(iconButtons[0]);
      expect(input).toHaveValue("");
    }
  });

  it("shows clear filters button when filters are active", () => {
    mockSearchParams.set("search", "test");

    render(<TrucksSearch />);

    expect(
      screen.getByRole("button", { name: /נקה סינון/ }),
    ).toBeInTheDocument();
  });

  it("clears all filters when clicking clear button", async () => {
    const user = userEvent.setup();
    mockSearchParams.set("search", "test");

    render(<TrucksSearch />);

    const clearButton = screen.getByRole("button", { name: /נקה סינון/ });
    await user.click(clearButton);

    expect(mockPush).toHaveBeenCalledWith("/trucks");
  });
});
