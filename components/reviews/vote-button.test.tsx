import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VoteButton } from "./vote-button";

vi.mock("@/app/actions/votes", () => ({
  toggleVote: vi.fn(),
}));

import { toggleVote } from "@/app/actions/votes";

const mockToggleVote = toggleVote as ReturnType<typeof vi.fn>;

describe("VoteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders vote count", () => {
    render(
      <VoteButton
        reviewId="review-123"
        initialVoteCount={5}
        initialHasVoted={false}
        isOwner={false}
      />,
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows voted state when user has voted", () => {
    render(
      <VoteButton
        reviewId="review-123"
        initialVoteCount={5}
        initialHasVoted={true}
        isOwner={false}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("text-primary");
  });

  it("calls toggleVote when clicked", async () => {
    mockToggleVote.mockResolvedValue({
      success: true,
      data: { voted: true, voteCount: 6 },
    });

    render(
      <VoteButton
        reviewId="review-123"
        initialVoteCount={5}
        initialHasVoted={false}
        isOwner={false}
      />,
    );

    await userEvent.click(screen.getByRole("button"));

    expect(mockToggleVote).toHaveBeenCalledWith({ reviewId: "review-123" });
  });

  it("updates vote count after toggle", async () => {
    mockToggleVote.mockResolvedValue({
      success: true,
      data: { voted: true, voteCount: 6 },
    });

    render(
      <VoteButton
        reviewId="review-123"
        initialVoteCount={5}
        initialHasVoted={false}
        isOwner={false}
      />,
    );

    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("removes vote when already voted", async () => {
    mockToggleVote.mockResolvedValue({
      success: true,
      data: { voted: false, voteCount: 4 },
    });

    render(
      <VoteButton
        reviewId="review-123"
        initialVoteCount={5}
        initialHasVoted={true}
        isOwner={false}
      />,
    );

    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("displays static count for review owner", () => {
    render(
      <VoteButton
        reviewId="review-123"
        initialVoteCount={5}
        initialHasVoted={false}
        isOwner={true}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("disables button while pending", async () => {
    mockToggleVote.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: { voted: true, voteCount: 6 },
              }),
            100,
          ),
        ),
    );

    render(
      <VoteButton
        reviewId="review-123"
        initialVoteCount={5}
        initialHasVoted={false}
        isOwner={false}
      />,
    );

    const button = screen.getByRole("button");
    await userEvent.click(button);
    expect(button).toBeDisabled();
  });
});
