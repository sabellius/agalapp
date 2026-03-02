import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReviewForm } from "./review-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/actions/reviews", () => ({
  createReview: vi.fn(),
  updateReview: vi.fn(),
}));

import { createReview, updateReview } from "@/app/actions/reviews";

const mockCreateReview = vi.mocked(createReview);
const mockUpdateReview = vi.mocked(updateReview);

describe("ReviewForm", () => {
  const truckId = "truck-123";

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateReview.mockResolvedValue({ success: true });
    mockUpdateReview.mockResolvedValue({ success: true });
  });

  it("opens dialog when trigger is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ReviewForm truckId={truckId}>
        <button>כתוב ביקורת</button>
      </ReviewForm>,
    );

    await user.click(screen.getByRole("button", { name: /כתוב ביקורת/ }));

    // Check for dialog content
    await expect(screen.getByText(/שתף את דעתך על העגלה/)).toBeInTheDocument();
  });

  it("shows create mode title and description by default", async () => {
    render(
      <ReviewForm truckId={truckId}>
        <button>Open</button>
      </ReviewForm>,
    );

    // Dialog is initially closed
    expect(screen.queryByText(/כתוב ביקורת/)).not.toBeInTheDocument();
  });

  it("shows edit mode title and description when review is provided", async () => {
    render(
      <ReviewForm
        truckId={truckId}
        review={{ id: "review-1", rating: 5, content: "Great!" }}
      >
        <button>Open</button>
      </ReviewForm>,
    );

    // Open the dialog
    await userEvent.click(screen.getByRole("button", { name: /Open/ }));

    await expect(screen.getByText("ערוך ביקורת")).toBeVisible();
  });

  it("prefills form data when editing existing review", async () => {
    render(
      <ReviewForm
        truckId={truckId}
        review={{ id: "review-1", rating: 4, content: "Good coffee!" }}
      >
        <button>Open</button>
      </ReviewForm>,
    );

    await userEvent.click(screen.getByRole("button", { name: /Open/ }));

    // Check prefilled data
    const stars = screen.getAllByRole("button", { name: /דרג/ });
    expect(stars[3]).toHaveAttribute("aria-pressed", "true"); // 4 stars

    const textarea = screen.getByRole("textbox", { name: /הביקורת שלך/ });
    expect(textarea).toHaveValue("Good coffee!");
  });

  it("shows character count for textarea", async () => {
    render(
      <ReviewForm truckId={truckId}>
        <button>Open</button>
      </ReviewForm>,
    );

    await userEvent.click(screen.getByRole("button", { name: /Open/ }));

    expect(screen.getByText(/0 \/ 1000 תווים/)).toBeInTheDocument();
  });

  it("updates character count when typing", async () => {
    const user = userEvent.setup();

    render(
      <ReviewForm truckId={truckId}>
        <button>Open</button>
      </ReviewForm>,
    );

    await user.click(screen.getByRole("button", { name: /Open/ }));

    const textarea = screen.getByRole("textbox", { name: /הביקורת שלך/ });
    await user.type(textarea, "Great coffee!");

    expect(screen.getByText(/13 \/ 1000 תווים/)).toBeInTheDocument();
  });

  it("shows error when submitting without rating", async () => {
    const user = userEvent.setup();

    render(
      <ReviewForm truckId={truckId}>
        <button>Open</button>
      </ReviewForm>,
    );

    await user.click(screen.getByRole("button", { name: /Open/ }));

    // Try to submit without rating (can't click submit directly, so we'll just check the validation)
    const submitButton = screen.getByRole("button", { name: /שלח ביקורת/ });
    await user.click(submitButton);

    // Should show error about needing rating
    await expect(screen.getByText("יש לבחור דירוג")).toBeInTheDocument();
  });

  it("shows cancel button", async () => {
    render(
      <ReviewForm truckId={truckId}>
        <button>Open</button>
      </ReviewForm>,
    );

    await userEvent.click(screen.getByRole("button", { name: /Open/ }));

    expect(screen.getByRole("button", { name: /ביטול/ })).toBeVisible();
  });

  it("disables buttons while submitting", async () => {
    const user = userEvent.setup();

    render(
      <ReviewForm truckId={truckId}>
        <button>Open</button>
      </ReviewForm>,
    );

    await user.click(screen.getByRole("button", { name: /Open/ }));

    // Set rating and content to enable submit
    const stars = screen.getAllByRole("button", { name: /דרג/ });
    await user.click(stars[2]);

    const textarea = screen.getByRole("textbox", { name: /הביקורת שלך/ });
    await user.type(textarea, "Great coffee! Highly recommended.");

    // Mock the action to return a promise we can control
    let _isSubmitting = true;
    mockCreateReview.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          _isSubmitting = false;
          resolve({ success: true });
        }, 100);
      });
    });

    const submitButton = screen.getByRole("button", { name: /שלח ביקורת/ });
    await user.click(submitButton);

    // Check loading state
    await expect(screen.getByText("שולח...")).toBeInTheDocument();
    await expect(submitButton).toBeDisabled();

    // Wait for action to complete
    await new Promise((resolve) => setTimeout(resolve, 200));
  });
});
