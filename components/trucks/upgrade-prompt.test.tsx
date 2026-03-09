import { render, screen } from "@testing-library/react";
import { UpgradePrompt } from "./upgrade-prompt";

// Mock useActionState from react
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useActionState: vi.fn(),
  };
});

import { useActionState } from "react";

const mockUseActionState = useActionState as ReturnType<typeof vi.fn>;

describe("UpgradePrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upgrade card by default", () => {
    mockUseActionState.mockReturnValue([
      { success: false, message: "" },
      vi.fn(),
      false,
    ]);

    render(<UpgradePrompt featureName="שעות פעילות" />);

    expect(screen.getByText("שדרג לפרימיום")).toBeInTheDocument();
    // Text is split by <strong> tag, so use a matcher function
    expect(
      screen.getByText((_content, element) => {
        return (
          element?.textContent ===
          "כדי להוסיף שעות פעילות, עליך לשדרג את החשבון למנוי פרימיום"
        );
      }),
    ).toBeInTheDocument();
    // "שעות פעילות" appears in both the message and the feature list
    expect(screen.getAllByText("שעות פעילות")).toHaveLength(2);
    expect(screen.getByText("תפריט מלא")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "שדרג עכשיו - ₪30/חודש" }),
    ).toBeInTheDocument();
  });

  it("shows premium features list", () => {
    mockUseActionState.mockReturnValue([
      { success: false, message: "" },
      vi.fn(),
      false,
    ]);

    render(<UpgradePrompt featureName="תפריט" />);

    expect(screen.getByText("עם מנוי פרימיום תקבל:")).toBeInTheDocument();
    expect(screen.getByText("שעות פעילות")).toBeInTheDocument();
    expect(screen.getByText("תפריט מלא")).toBeInTheDocument();
  });

  it("displays custom feature name in message", () => {
    mockUseActionState.mockReturnValue([
      { success: false, message: "" },
      vi.fn(),
      false,
    ]);

    render(<UpgradePrompt featureName="תפריט מיוחד" />);

    expect(screen.getByText(/תפריט מיוחד/)).toBeInTheDocument();
  });

  it("shows error message when upgrade fails", () => {
    mockUseActionState.mockReturnValue([
      { success: false, message: "שגיאה בשדרוג" },
      vi.fn(),
      false,
    ]);

    render(<UpgradePrompt featureName="שעות פעילות" />);

    expect(screen.getByText("שגיאה בשדרוג")).toBeInTheDocument();
  });

  it("shows success state after successful upgrade", () => {
    mockUseActionState.mockReturnValue([
      { success: true, message: "" },
      vi.fn(),
      false,
    ]);

    render(<UpgradePrompt featureName="שעות פעילות" />);

    expect(screen.getByText("המנוי שודרג!")).toBeInTheDocument();
    expect(
      screen.getByText("החשבון שלך כעת במנוי פרימיום ל-30 יום"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "שדרג עכשיו" }),
    ).not.toBeInTheDocument();
  });

  it("disables button while pending", () => {
    const mockAction = vi.fn();
    mockUseActionState.mockReturnValue([
      { success: false, message: "" },
      mockAction,
      true,
    ]);

    render(<UpgradePrompt featureName="שעות פעילות" />);

    const button = screen.getByRole("button", { name: "משדרג..." });
    expect(button).toBeDisabled();
  });
});
