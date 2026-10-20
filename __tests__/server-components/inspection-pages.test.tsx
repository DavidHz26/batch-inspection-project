import { screen } from "@testing-library/react";
import NewInspectionPage from "@/app/inspections/new/page";
import EditInspectionPage from "@/app/inspections/[id]/edit/page";
import { pageParams, renderServerComponent } from "../helpers/server-component";
import { inspection, product } from "../helpers/fixtures";

jest.mock("next/navigation", () => ({
  usePathname: () => "/inspections",
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("@/app/inspections/actions", () => ({
  createInspection: jest.fn(),
  updateInspection: jest.fn(),
  deleteInspection: jest.fn(),
}));

jest.mock("@/lib/organization", () => ({
  getCurrentOrganizationId: jest.fn(),
}));

jest.mock("@/lib/products", () => ({
  getProducts: jest.fn(),
}));

jest.mock("@/lib/inspections", () => ({
  getInspection: jest.fn(),
}));

import { getCurrentOrganizationId } from "@/lib/organization";
import { getProducts } from "@/lib/products";
import { getInspection } from "@/lib/inspections";

const inactive_product = { ...product, id: "prod-2", sku: "P002", name: "Old", is_active: false };
const other_inactive_product = { ...product, id: "prod-3", sku: "P003", name: "Gone", is_active: false };

function productOptions() {
  return screen
    .getAllByRole("option")
    .map((option) => option.textContent)
    .filter((text) => text !== "Selecciona un producto...");
}

describe("inspection pages (server components)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("NewInspectionPage", () => {
    it("asks for an organization before registering inspections", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);

      await renderServerComponent(NewInspectionPage());

      expect(
        screen.getByText("Select an organization to register inspections."),
      ).toBeInTheDocument();
      expect(getProducts).not.toHaveBeenCalled();
    });

    it("warns when the organization has no active products", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
      (getProducts as jest.Mock).mockResolvedValue([inactive_product]);

      await renderServerComponent(NewInspectionPage());

      expect(
        screen.getByText("No active products available. Please create a product first."),
      ).toBeInTheDocument();
    });

    it("only offers active products in the form", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
      (getProducts as jest.Mock).mockResolvedValue([product, inactive_product]);

      await renderServerComponent(NewInspectionPage());

      expect(getProducts).toHaveBeenCalledWith("org-1");
      expect(productOptions()).toEqual(["P001 - Widget"]);
      expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    });
  });

  describe("EditInspectionPage", () => {
    it("keeps the inspected product selectable even if it is inactive", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
      (getInspection as jest.Mock).mockResolvedValue({ ...inspection, product_id: "prod-2" });
      (getProducts as jest.Mock).mockResolvedValue([
        product,
        inactive_product,
        other_inactive_product,
      ]);

      await renderServerComponent(EditInspectionPage(pageParams("insp-1")));

      expect(getInspection).toHaveBeenCalledWith("insp-1");
      expect(productOptions()).toEqual(["P001 - Widget", "P002 - Old"]);
    });

    it("shows the rounded percentage when it matches the status", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
      (getInspection as jest.Mock).mockResolvedValue(inspection);
      (getProducts as jest.Mock).mockResolvedValue([product]);

      await renderServerComponent(EditInspectionPage(pageParams("insp-1")));

      expect(screen.getByRole("heading", { name: /Batch B-001/ })).toBeInTheDocument();
      expect(screen.getByText(/2% defects/)).toBeInTheDocument();
      expect(screen.queryByText(/exact value used for the status/)).not.toBeInTheDocument();
    });

    it("shows the exact percentage when rounding would hide the real status", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
      (getInspection as jest.Mock).mockResolvedValue({
        ...inspection,
        units_inspected: 100000,
        units_defective: 5001,
        defect_percentage: 5,
        status: "Observations",
      });
      (getProducts as jest.Mock).mockResolvedValue([product]);

      await renderServerComponent(EditInspectionPage(pageParams("insp-1")));

      expect(screen.getByText("5.001% defects")).toBeInTheDocument();
      expect(
        screen.getByText(/exact value used for the status; shown as 5%/),
      ).toBeInTheDocument();
    });

    it("returns 404 when there is no active organization", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);

      await expect(
        renderServerComponent(EditInspectionPage(pageParams("insp-1"))),
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(getInspection).not.toHaveBeenCalled();
    });

    it("returns 404 when the inspection does not exist", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
      (getInspection as jest.Mock).mockResolvedValue(null);
      (getProducts as jest.Mock).mockResolvedValue([product]);

      await expect(
        renderServerComponent(EditInspectionPage(pageParams("missing"))),
      ).rejects.toThrow("NEXT_NOT_FOUND");
    });
  });
});
