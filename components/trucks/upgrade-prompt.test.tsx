import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpgradePrompt } from "./upgrade-prompt";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/actions/subscription", () => ({
  upgradeAccount: vi.fn(),
}));

import { upgradeAccount } from "@/app/actions/subscription";

const mockUpgradeAccount = vi.mocked(upgradeAccount);

describe("UpgradePrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upgrade card by default", () => {
    render(<UpgradePrompt featureName="שעות פעילות" />);

    expect(screen.getByText("שדרג לפרימיום")).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) => {
        return (
          element?.textContent ===
          "כדי להוסיף שעות פעילות, עליך לשדרג את החשבון למנוי פרימיום"
        );
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "שדרג עכשיו - ₪30/חודש" }),
    ).toBeInTheDocument();
  });

  it("shows premium features list", () => {
    render(<UpgradePrompt featureName="תפריט" />);

    expect(screen.getByText("עם מנוי פרימיום תקבל:")).toBeInTheDocument();
    expect(screen.getByText("שעות פעילות")).toBeInTheDocument();
  });

  it("displays custom feature name in message", () => {
    render(<UpgradePrompt featureName="תפריט מיוחד" />);

    expect(screen.getByText(/תפריט מיוחד/)).toBeInTheDocument();
  });

  it("shows success state after successful upgrade", async () => {
    const user = userEvent.setup();
    mockUpgradeAccount.mockResolvedValue({
      success: true,
      data: { expiryDate: new Date() },
    });

    render(<UpgradePrompt featureName="שעות פעילות" />);

    await user.click(
      screen.getByRole("button", { name: "שדרג עכשיו - ₪30/חודש" }),
    );
    await user.click(screen.getByRole("button", { name: "אישור שדרוג" }));

    expect(screen.getByText("המנוי שודרג!")).toBeInTheDocument();
    expect(
      screen.getByText("החשבון שלך כעת במנוי פרימיום ל-30 יום"),
    ).toBeInTheDocument();
  });

  it("shows error message when upgrade fails", async () => {
    const user = userEvent.setup();
    mockUpgradeAccount.mockResolvedValue({
      success: false,
      message: "שגיאה בשדרוג",
    });

    render(<UpgradePrompt featureName="שעות פעילות" />);

    await user.click(
      screen.getByRole("button", { name: "שדרג עכשיו - ₪30/חודש" }),
    );
    await user.click(screen.getByRole("button", { name: "אישור שדרוג" }));

    expect(screen.getByText("שגיאה בשדרוג")).toBeInTheDocument();
  });

  it("disables button while pending", async () => {
    const user = userEvent.setup();
    mockUpgradeAccount.mockImplementation(() => new Promise(() => {}));

    render(<UpgradePrompt featureName="שעות פעילות" />);

    await user.click(
      screen.getByRole("button", { name: "שדרג עכשיו - ₪30/חודש" }),
    );
    await user.click(screen.getByRole("button", { name: "אישור שדרוג" }));

    expect(screen.getByText("משדרג...")).toBeInTheDocument();
  });
});
