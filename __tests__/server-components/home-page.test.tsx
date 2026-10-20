import { screen } from "@testing-library/react";
import Home from "@/app/page";
import { renderServerComponent } from "../helpers/server-component";
import { inspection } from "../helpers/fixtures";

jest.mock("@/lib/organization", () => ({
  getCurrentOrganizationId: jest.fn(),
}));

jest.mock("@/lib/inspections", () => ({
  getInspectionUnits: jest.fn(),
}));

jest.mock("@/app/bar-chart", () => ({
  DefectsBarChart: ({ data }: { data: unknown }) => (
    <pre data-testid="bar-chart">{JSON.stringify(data)}</pre>
  ),
}));

jest.mock("@/app/trend-chart", () => ({
  QualityTrendChart: ({ data }: { data: unknown }) => (
    <pre data-testid="trend-chart">{JSON.stringify(data)}</pre>
  ),
}));

jest.mock("@/app/pie-chart", () => ({
  QualityPieChart: ({ data }: { data: unknown }) => (
    <pre data-testid="pie-chart">{JSON.stringify(data)}</pre>
  ),
}));

import { getCurrentOrganizationId } from "@/lib/organization";
import { getInspectionUnits } from "@/lib/inspections";

function chartData(test_id: string) {
  return JSON.parse(screen.getByTestId(test_id).textContent ?? "null");
}

describe("Home page (server component)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("asks for an organization and skips loading inspections", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);

    await renderServerComponent(Home());

    expect(screen.getByRole("heading", { name: "Summary" })).toBeInTheDocument();
    expect(
      screen.getByText("Select an organization to see its summary."),
    ).toBeInTheDocument();
    expect(getInspectionUnits).not.toHaveBeenCalled();
  });

  it("builds the chart data from the organization inspections", async () => {
    const second = {
      ...inspection,
      id: "insp-2",
      units_inspected: 50,
      units_defective: 10,
      products: { sku: "P002", name: "Gadget" },
    };
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
    (getInspectionUnits as jest.Mock).mockResolvedValue([inspection, second]);

    await renderServerComponent(Home());

    const bar_data = [
      { name: "#1", defects: 2, inspected: 100, defective: 2 },
      { name: "#2", defects: 10, inspected: 50, defective: 10 },
    ];
    expect(chartData("bar-chart")).toEqual(bar_data);
    expect(chartData("trend-chart")).toEqual(bar_data);
    expect(chartData("pie-chart")).toEqual([
      { name: "Approved Units", value: 138, color: "#22c55e" },
      { name: "Defective Units", value: 12, color: "#ef4444" },
    ]);
    expect(screen.getByText("P002 - Gadget")).toBeInTheDocument();
  });

  it("renders empty charts when the organization has no inspections", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
    (getInspectionUnits as jest.Mock).mockResolvedValue([]);

    await renderServerComponent(Home());

    expect(chartData("bar-chart")).toEqual([]);
    expect(chartData("pie-chart")).toEqual([
      { name: "Approved Units", value: 0, color: "#22c55e" },
      { name: "Defective Units", value: 0, color: "#ef4444" },
    ]);
  });
});
