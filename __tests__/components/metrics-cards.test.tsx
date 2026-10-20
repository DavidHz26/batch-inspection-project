import { render, screen } from "@testing-library/react";
import { MetricsCards } from "@/app/metrics-cards";

describe("MetricsCards", () => {
  it("renders metric values and an optional title", () => {
    render(
      <MetricsCards
        title="All inspections"
        metrics={{
          total_inspections: 2,
          total_inspected_units: 150,
          total_defective_units: 5,
          global_defect_percentage: 3.33,
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "All inspections" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3.33%")).toBeInTheDocument();
  });

  it("shows No data when there are no inspections", () => {
    render(
      <MetricsCards
        metrics={{
          total_inspections: 0,
          total_inspected_units: 0,
          total_defective_units: 0,
          global_defect_percentage: null,
        }}
      />,
    );
    expect(screen.getByText("No data")).toBeInTheDocument();
  });
});
