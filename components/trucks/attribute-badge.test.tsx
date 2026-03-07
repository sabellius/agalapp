import { render, screen } from "@testing-library/react";
import { AttributeBadge } from "./attribute-badge";

describe("AttributeBadge", () => {
  it("renders attribute name", () => {
    render(<AttributeBadge name="נגיש" icon="accessibility" />);
    expect(screen.getByText("נגיש")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(
      <AttributeBadge name="WiFi" icon="wifi" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders default icon when none provided", () => {
    const { container } = render(<AttributeBadge name="Test" icon="invalid-icon" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("has correct styling classes", () => {
    const { container } = render(
      <AttributeBadge name="Test" icon="tag" />,
    );

    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass("bg-secondary");
    expect(badge).toHaveClass("rounded-full");
  });
});
