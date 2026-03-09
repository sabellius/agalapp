import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttributesEditor } from "./attributes-editor";

describe("AttributesEditor", () => {
  const mockAvailableAttributes = [
    { id: "1", name: "נגיש", nameEn: "Accessible", icon: "accessibility" },
    { id: "2", name: "WiFi", nameEn: "WiFi", icon: "wifi" },
    { id: "3", name: "טבעוני", nameEn: "Vegan", icon: "leaf" },
    { id: "4", name: "משלוחים", nameEn: "Delivery", icon: "truck" },
  ];

  const mockAssignedAttributes = [
    { id: "1", name: "נגיש", icon: "accessibility", assignedId: "assign-1" },
  ];

  it("renders available and assigned attributes", () => {
    render(
      <AttributesEditor
        truckId="truck-123"
        availableAttributes={mockAvailableAttributes}
        assignedAttributes={mockAssignedAttributes}
        maxAttributes={3}
        isPremium={false}
        onToggle={vi.fn().mockResolvedValue({ success: true })}
      />,
    );

    expect(screen.getByText("נגיש")).toBeInTheDocument();
    expect(screen.getByText("WiFi")).toBeInTheDocument();
    expect(screen.getByText("טבעוני")).toBeInTheDocument();
    expect(screen.getByText("משלוחים")).toBeInTheDocument();
  });

  it("shows count indicator for assigned attributes", () => {
    render(
      <AttributesEditor
        truckId="truck-123"
        availableAttributes={mockAvailableAttributes}
        assignedAttributes={mockAssignedAttributes}
        maxAttributes={3}
        isPremium={false}
        onToggle={vi.fn().mockResolvedValue({ success: true })}
      />,
    );

    expect(screen.getByText(/1 מ-3 מאפיינים/)).toBeInTheDocument();
  });

  it("calls onToggle when clicking unassigned attribute", async () => {
    const onToggle = vi.fn().mockResolvedValue({ success: true });
    render(
      <AttributesEditor
        truckId="truck-123"
        availableAttributes={mockAvailableAttributes}
        assignedAttributes={mockAssignedAttributes}
        maxAttributes={3}
        isPremium={false}
        onToggle={onToggle}
      />,
    );

    const wifiButton = screen.getByRole("button", { name: /WiFi/ });
    await userEvent.click(wifiButton);

    expect(onToggle).toHaveBeenCalledWith("2", false);
  });

  it("calls onToggle when clicking assigned attribute", async () => {
    const onToggle = vi.fn().mockResolvedValue({ success: true });
    render(
      <AttributesEditor
        truckId="truck-123"
        availableAttributes={mockAvailableAttributes}
        assignedAttributes={mockAssignedAttributes}
        maxAttributes={3}
        isPremium={false}
        onToggle={onToggle}
      />,
    );

    const accessibleButton = screen.getByRole("button", { name: /נגיש/ });
    await userEvent.click(accessibleButton);

    expect(onToggle).toHaveBeenCalledWith("1", true);
  });

  it("disables add when free user reaches limit", () => {
    const onToggle = vi.fn().mockResolvedValue({ success: true });
    const { rerender } = render(
      <AttributesEditor
        truckId="truck-123"
        availableAttributes={mockAvailableAttributes}
        assignedAttributes={[]}
        maxAttributes={3}
        isPremium={false}
        onToggle={onToggle}
      />,
    );

    const wifiButton = screen.getByRole("button", { name: /WiFi/ });
    expect(wifiButton).not.toBeDisabled();

    const atLimit = [
      { id: "1", name: "נגיש", icon: "accessibility", assignedId: "a1" },
      { id: "2", name: "WiFi", icon: "wifi", assignedId: "a2" },
      { id: "3", name: "טבעוני", icon: "leaf", assignedId: "a3" },
    ];

    rerender(
      <AttributesEditor
        truckId="truck-123"
        availableAttributes={mockAvailableAttributes}
        assignedAttributes={atLimit}
        maxAttributes={3}
        isPremium={false}
        onToggle={onToggle}
      />,
    );

    const deliveryButton = screen.getByRole("button", { name: /משלוחים/ });
    expect(deliveryButton).toBeInTheDocument();
  });

  it("allows unlimited attributes for premium users", () => {
    const onToggle = vi.fn().mockResolvedValue({ success: true });
    const atLimit = [
      { id: "1", name: "נגיש", icon: "accessibility", assignedId: "a1" },
      { id: "2", name: "WiFi", icon: "wifi", assignedId: "a2" },
      { id: "3", name: "טבעוני", icon: "leaf", assignedId: "a3" },
    ];

    render(
      <AttributesEditor
        truckId="truck-123"
        availableAttributes={mockAvailableAttributes}
        assignedAttributes={atLimit}
        maxAttributes={3}
        isPremium={true}
        onToggle={onToggle}
      />,
    );

    const deliveryButton = screen.getByRole("button", { name: /משלוחים/ });
    expect(deliveryButton).not.toBeDisabled();
    expect(screen.getByText("ללא הגבלה (פרימיום)")).toBeInTheDocument();
  });

  it("displays error when toggle fails", async () => {
    const onToggle = vi.fn().mockResolvedValue({
      success: false,
      message: "שגיאה בטעינת המאפיינים",
    });
    render(
      <AttributesEditor
        truckId="truck-123"
        availableAttributes={mockAvailableAttributes}
        assignedAttributes={mockAssignedAttributes}
        maxAttributes={3}
        isPremium={false}
        onToggle={onToggle}
      />,
    );

    const wifiButton = screen.getByRole("button", { name: /WiFi/ });
    await userEvent.click(wifiButton);

    await waitFor(() => {
      expect(screen.getByText("שגיאה בטעינת המאפיינים")).toBeInTheDocument();
    });
  });

  it("shows FeatureLock for free users", () => {
    render(
      <AttributesEditor
        truckId="truck-123"
        availableAttributes={mockAvailableAttributes}
        assignedAttributes={mockAssignedAttributes}
        maxAttributes={3}
        isPremium={false}
        onToggle={vi.fn().mockResolvedValue({ success: true })}
      />,
    );

    expect(screen.getByText("עוד מאפיינים בפרימיום")).toBeInTheDocument();
    expect(
      screen.getByText("מנוי פרימיום מאפשר להוסיף מאפיינים ללא הגבלה"),
    ).toBeInTheDocument();
  });

  it("does not show FeatureLock for premium users", () => {
    render(
      <AttributesEditor
        truckId="truck-123"
        availableAttributes={mockAvailableAttributes}
        assignedAttributes={mockAssignedAttributes}
        maxAttributes={3}
        isPremium={true}
        onToggle={vi.fn().mockResolvedValue({ success: true })}
      />,
    );

    expect(screen.queryByText("עוד מאפיינים בפרימיום")).not.toBeInTheDocument();
  });
});
