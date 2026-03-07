import { render, screen } from "@testing-library/react";
import { AttributesGrid } from "./attributes-grid";

describe("AttributesGrid", () => {
  const mockAttributes = [
    { name: "נגיש", icon: "accessibility" },
    { name: "WiFi", icon: "wifi" },
    { name: "טבעוני", icon: "leaf" },
  ];

  it("renders all attributes", () => {
    render(<AttributesGrid attributes={mockAttributes} />);

    expect(screen.getByText("נגיש")).toBeInTheDocument();
    expect(screen.getByText("WiFi")).toBeInTheDocument();
    expect(screen.getByText("טבעוני")).toBeInTheDocument();
  });

  it("renders empty message when no attributes", () => {
    render(<AttributesGrid attributes={[]} />);
    expect(screen.getByText("אין מאפיינים")).toBeInTheDocument();
  });

  it("renders custom empty message", () => {
    render(<AttributesGrid attributes={[]} emptyMessage="ללא מאפיינים" />);
    expect(screen.getByText("ללא מאפיינים")).toBeInTheDocument();
  });

  it("renders AttributeBadge for each attribute", () => {
    const { container } = render(
      <AttributesGrid attributes={mockAttributes} />,
    );

    const badges = container.querySelectorAll(".bg-secondary");
    expect(badges).toHaveLength(3);
  });

  it("uses flex wrap layout", () => {
    const { container } = render(
      <AttributesGrid attributes={mockAttributes} />,
    );

    const grid = container.querySelector(".flex.flex-wrap");
    expect(grid).toBeInTheDocument();
  });
});
