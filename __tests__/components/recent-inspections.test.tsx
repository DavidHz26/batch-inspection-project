import { render, screen } from "@testing-library/react";
import { RecentInspectionsList } from "@/app/recent-inspections";

describe("RecentInspectionsList", () => {
  it("shows the last five inspections in reverse order", () => {
    const inspections = Array.from({ length: 6 }, (_, index) => ({
      units_inspected: 10,
      units_defective: index,
      products: { sku: `P00${index}`, name: `Item ${index}` },
    }));

    render(<RecentInspectionsList inspections={inspections} />);
    expect(screen.queryByText("P000 - Item 0")).not.toBeInTheDocument();
    expect(screen.getByText("P005 - Item 5")).toBeInTheDocument();
    expect(screen.getByText("P001 - Item 1")).toBeInTheDocument();
  });
});
