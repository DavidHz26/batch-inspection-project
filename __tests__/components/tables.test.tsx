import { render, screen } from "@testing-library/react";
import { OrganizationTable } from "@/app/organizations/organization-table";
import { ProductTable } from "@/app/products/product-table";
import { InspectionTable } from "@/app/inspections/inspection-table";
import { inspection, org, product } from "../helpers/fixtures";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
}));

jest.mock("@/lib/organization", () => ({
  getCurrentOrganizationId: jest.fn(),
  getOrganizationsPage: jest.fn(),
}));

jest.mock("@/lib/products", () => ({
  getProductsPage: jest.fn(),
  getProducts: jest.fn(),
}));

jest.mock("@/lib/inspections", () => ({
  getInspections: jest.fn(),
  getInspectionUnits: jest.fn(),
}));

import { getCurrentOrganizationId, getOrganizationsPage } from "@/lib/organization";
import { getProducts, getProductsPage } from "@/lib/products";
import { getInspections, getInspectionUnits } from "@/lib/inspections";

describe("server tables", () => {
  it("shows an empty organizations state", async () => {
    (getOrganizationsPage as jest.Mock).mockResolvedValue({ data: [], count: 0 });
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);
    const info = jest.spyOn(console, "info").mockImplementation(() => {});
    render(await OrganizationTable({ search_params: Promise.resolve({}) }));
    expect(screen.getByText("No organizations registered.")).toBeInTheDocument();
    info.mockRestore();
  });

  it("renders organization rows and marks the current one", async () => {
    (getOrganizationsPage as jest.Mock).mockResolvedValue({ data: [org], count: 1 });
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
    render(await OrganizationTable({ search_params: Promise.resolve({ page: "1" }) }));
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("asks the user to select an organization before listing products", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);
    render(await ProductTable({ search_params: Promise.resolve({}) }));
    expect(
      screen.getByText("Select an organization to see its products."),
    ).toBeInTheDocument();
  });

  it("renders product rows", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
    (getProductsPage as jest.Mock).mockResolvedValue({ data: [product], count: 1 });
    render(await ProductTable({ search_params: Promise.resolve({}) }));
    expect(screen.getByText("Widget")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows a filtered empty state for inspections", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
    (getProducts as jest.Mock).mockResolvedValue([product]);
    (getInspections as jest.Mock).mockResolvedValue({ data: [], count: 0 });
    (getInspectionUnits as jest.Mock).mockResolvedValue([]);
    render(
      await InspectionTable({
        search_params: Promise.resolve({ status: "Rejected" }),
      }),
    );
    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clean filters" })).toHaveAttribute(
      "href",
      "/inspections",
    );
  });

  it("renders inspection rows with product and status", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
    (getProducts as jest.Mock).mockResolvedValue([product]);
    (getInspections as jest.Mock).mockResolvedValue({ data: [inspection], count: 1 });
    (getInspectionUnits as jest.Mock).mockResolvedValue([inspection]);
    render(await InspectionTable({ search_params: Promise.resolve({}) }));
    expect(screen.getByText("B-001")).toBeInTheDocument();
    expect(screen.getAllByText("P001 - Widget").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
  });

  it("syncs the filter selects with the URL when the page is reused", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
    (getProducts as jest.Mock).mockResolvedValue([product]);
    (getInspections as jest.Mock).mockResolvedValue({ data: [inspection], count: 1 });
    (getInspectionUnits as jest.Mock).mockResolvedValue([inspection]);

    const { rerender } = render(
      await InspectionTable({
        search_params: Promise.resolve({ product_id: "prod-1", status: "Rejected", page_size: "20" }),
      }),
    );
    expect(screen.getByRole("combobox", { name: "Product" })).toHaveValue("prod-1");
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue("Rejected");
    expect(screen.getByRole("combobox", { name: "Items" })).toHaveValue("20");

    rerender(await InspectionTable({ search_params: Promise.resolve({}) }));
    expect(screen.getByRole("combobox", { name: "Product" })).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Items" })).toHaveValue("10");
  });
});
