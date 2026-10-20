import { render, screen } from "@testing-library/react";
import { DefectPercentage } from "@/app/inspections/defect-percentage";

describe("DefectPercentage", () => {
  it("renders a plain percentage when rounding is not misleading", () => {
    render(
      <DefectPercentage
        units_inspected={100}
        units_defective={2}
        defect_percentage={2}
      />,
    );
    expect(screen.getByText("2%")).toBeInTheDocument();
    expect(screen.queryByTitle(/Exact:/)).not.toBeInTheDocument();
  });

  it("shows an exact-value hint when rounding would change the status", () => {
    render(
      <DefectPercentage
        units_inspected={4999}
        units_defective={250}
        defect_percentage={5}
      />,
    );
    expect(screen.getByTitle(/Exact: 5.001%/)).toBeInTheDocument();
    expect(screen.getByText("5%")).toBeInTheDocument();
  });
});
