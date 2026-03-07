import { render, screen } from "@testing-library/react";
import { FeatureLock } from "./feature-lock";

describe("FeatureLock", () => {
  it("renders title and description", () => {
    render(
      <FeatureLock
        title="שדרוג נדרש"
        description="תכונה זו זמינה למשתמשי פרימיום בלבד"
      />,
    );

    expect(screen.getByText("שדרוג נדרש")).toBeInTheDocument();
    expect(
      screen.getByText("תכונה זו זמינה למשתמשי פרימיום בלבד"),
    ).toBeInTheDocument();
  });

  it("renders current and max count", () => {
    render(
      <FeatureLock
        title="שדרוג נדרש"
        description="תכונה זו זמינה למשתמשי פרימיום בלבד"
        currentCount={2}
        maxCount={5}
      />,
    );

    expect(screen.getByText("2 מ-5 בשימוש כרגע")).toBeInTheDocument();
  });

  it("renders upgrade button with link", () => {
    render(
      <FeatureLock
        title="שדרוג נדרש"
        description="תכונה זו זמינה למשתמשי פרימיום בלבד"
      />,
    );

    const upgradeLink = screen.getByRole("link", { name: /שדרג לפרימיום/ });
    expect(upgradeLink).toBeInTheDocument();
    expect(upgradeLink).toHaveAttribute("href", "/subscription");
  });

  it("renders crown icon", () => {
    const { container } = render(
      <FeatureLock
        title="שדרוג נדרש"
        description="תכונה זו זמינה למשתמשי פרימיום בלבד"
      />,
    );

    const crownIcon = container.querySelector("svg");
    expect(crownIcon).toBeInTheDocument();
  });

  it("has correct styling for premium highlight", () => {
    const { container } = render(
      <FeatureLock
        title="שדרוג נדרש"
        description="תכונה זו זמינה למשתמשי פרימיום בלבד"
      />,
    );

    const card = container.querySelector(".border-primary\\/50");
    expect(card).toBeInTheDocument();
  });
});
