import { formData, org, product } from "../helpers/fixtures";

const revalidatePath = jest.fn();
const cookiesSet = jest.fn();
const redirect = jest.fn();

jest.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({ set: cookiesSet })),
}));

jest.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => redirect(...args),
}));

jest.mock("@/lib/organization", () => ({
  ORGANIZATION_COOKIE: "organization_id",
  getOrganizations: jest.fn(),
  getOrganization: jest.fn(),
  insertOrganization: jest.fn(),
  updateOrganization: jest.fn(),
  deleteOrganization: jest.fn(),
}));

jest.mock("@/lib/products", () => ({
  insertProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

jest.mock("@/lib/inspections", () => ({
  insertInspection: jest.fn(),
  updateInspection: jest.fn(),
  deleteInspection: jest.fn(),
}));

jest.mock("@/lib/demo-data", () => ({
  isDemoDataEnabled: jest.fn(),
  loadDemoData: jest.fn(),
  resetOrganizationData: jest.fn(),
}));

import * as orgData from "@/lib/organization";
import * as productData from "@/lib/products";
import * as inspectionData from "@/lib/inspections";
import {
  createOrganization,
  deleteOrganization,
  selectOrganization,
  updateOrganization,
} from "@/app/organizations/actions";
import { createProduct, deleteProduct, updateProduct } from "@/app/products/actions";
import {
  createInspection,
  deleteInspection,
  updateInspection,
} from "@/app/inspections/actions";

describe("server actions", () => {
  let console_error: jest.SpyInstance;

  const inspection_form = {
    product_id: "prod-1",
    batch_number: "B-001",
    inspection_date: "2026-03-01",
    units_inspected: "10",
    units_defective: "2",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console_error = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console_error.mockRestore();
  });

  function expectSuccessRedirect(path: string, message: string) {
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(cookiesSet).toHaveBeenCalledWith(
      "flash",
      JSON.stringify({ variant: "success", message }),
      expect.anything(),
    );
    expect(redirect).toHaveBeenCalledWith(path);
  }

  function expectNoRedirect() {
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  }

  describe("organization actions", () => {
    it("selects a valid organization and revalidates the layout", async () => {
      (orgData.getOrganizations as jest.Mock).mockResolvedValue([org]);
      await selectOrganization(formData({ organization_id: "org-1" }));
      expect(cookiesSet).toHaveBeenCalledWith(
        "organization_id",
        "org-1",
        expect.objectContaining({ httpOnly: true }),
      );
      expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
    });

    it("rejects an unknown organization id", async () => {
      (orgData.getOrganizations as jest.Mock).mockResolvedValue([org]);
      await expect(
        selectOrganization(formData({ organization_id: "nope" })),
      ).rejects.toThrow("Organización no válida");
    });

    it("creates an organization, sets the cookie, and redirects", async () => {
      (orgData.insertOrganization as jest.Mock).mockResolvedValue(org);
      await createOrganization(null, formData({ name: "Acme" }));
      expect(cookiesSet).toHaveBeenCalledWith("organization_id", "org-1", expect.anything());
      expectSuccessRedirect("/organizations", "Organization created successfully.");
    });

    it("updates an organization and derives the slug from the name", async () => {
      (orgData.updateOrganization as jest.Mock).mockResolvedValue(org);
      await updateOrganization("org-1", null, formData({ name: "Acme Labs" }));
      expect(orgData.updateOrganization).toHaveBeenCalledWith("org-1", {
        name: "Acme Labs",
        slug: "acme-labs",
      });
      expectSuccessRedirect("/organizations", "Organization updated successfully.");
    });

    it("deletes an organization and redirects", async () => {
      (orgData.deleteOrganization as jest.Mock).mockResolvedValue(undefined);
      await deleteOrganization("org-1");
      expect(orgData.deleteOrganization).toHaveBeenCalledWith("org-1");
      expectSuccessRedirect("/organizations", "Organization deleted successfully.");
    });

    it("rejects deleting an organization without an id", async () => {
      const state = await deleteOrganization("");
      expect(state).toMatchObject({ status: "error", message: "Invalid organization ID" });
      expect(orgData.deleteOrganization).not.toHaveBeenCalled();
      expectNoRedirect();
    });
  });

  describe("product actions", () => {
    it("creates a product and redirects with flash message", async () => {
      (productData.insertProduct as jest.Mock).mockResolvedValue(product);
      await createProduct(null, formData({ sku: "P001", name: "Widget", is_active: "on" }));
      expect(productData.insertProduct).toHaveBeenCalledWith({
        sku: "P001",
        name: "Widget",
        is_active: true,
      });
      expectSuccessRedirect("/products", "Product created successfully.");
    });

    it("returns a validation error from product create instead of redirecting", async () => {
      const state = await createProduct(null, formData({ name: "Widget" }));
      expect(state).toMatchObject({
        status: "error",
        title: "Validation error",
      });
      expect(productData.insertProduct).not.toHaveBeenCalled();
      expectNoRedirect();
    });

    it("updates a product and treats a missing checkbox as inactive", async () => {
      (productData.updateProduct as jest.Mock).mockResolvedValue({});
      await updateProduct("prod-1", null, formData({ sku: "P001", name: "Widget" }));
      expect(productData.updateProduct).toHaveBeenCalledWith("prod-1", {
        sku: "P001",
        name: "Widget",
        is_active: false,
      });
      expectSuccessRedirect("/products", "Product updated successfully.");
    });

    it("rejects updating or deleting a product without an id", async () => {
      const updated = await updateProduct("", null, formData({ sku: "P001", name: "Widget" }));
      const deleted = await deleteProduct("");
      expect(updated).toMatchObject({ status: "error", message: "Invalid product ID" });
      expect(deleted).toMatchObject({ status: "error", message: "Invalid product ID" });
      expect(productData.updateProduct).not.toHaveBeenCalled();
      expect(productData.deleteProduct).not.toHaveBeenCalled();
      expectNoRedirect();
    });

    it("shows why a product with inspections cannot be deleted", async () => {
      (productData.deleteProduct as jest.Mock).mockRejectedValue(
        new Error("Cant delete a product associated with an inspection."),
      );
      const state = await deleteProduct("prod-1");
      expect(state).toEqual({
        status: "error",
        title: "Could not delete the product",
        message: "Cant delete a product associated with an inspection.",
      });
      expectNoRedirect();
    });

    it("deletes a product and redirects", async () => {
      (productData.deleteProduct as jest.Mock).mockResolvedValue(undefined);
      await deleteProduct("prod-1");
      expect(productData.deleteProduct).toHaveBeenCalledWith("prod-1");
      expectSuccessRedirect("/products", "Product deleted successfully.");
    });
  });

  describe("inspection actions", () => {
    it("creates an inspection after classifying the form values", async () => {
      (inspectionData.insertInspection as jest.Mock).mockResolvedValue({});
      await createInspection(
        null,
        formData({
          product_id: "prod-1",
          batch_number: "B-001",
          inspection_date: "2026-03-01",
          units_inspected: "100",
          units_defective: "2",
        }),
      );
      expect(inspectionData.insertInspection).toHaveBeenCalledWith(
        expect.objectContaining({ status: "Approved", defect_percentage: 2 }),
      );
      expectSuccessRedirect("/inspections", "Inspection created successfully.");
    });

    it("updates an inspection with a recalculated classification", async () => {
      (inspectionData.updateInspection as jest.Mock).mockResolvedValue({});
      await updateInspection("insp-1", null, formData(inspection_form));
      expect(inspectionData.updateInspection).toHaveBeenCalledWith(
        "insp-1",
        expect.objectContaining({ defect_percentage: 20, status: "Rejected" }),
      );
      expectSuccessRedirect("/inspections", "Inspection updated successfully.");
    });

    it("returns a validation error from inspection update without saving", async () => {
      const state = await updateInspection(
        "insp-1",
        null,
        formData({ ...inspection_form, units_defective: "11" }),
      );
      expect(state).toMatchObject({ status: "error", title: "Validation error" });
      expect(inspectionData.updateInspection).not.toHaveBeenCalled();
      expectNoRedirect();
    });

    it("deletes an inspection and redirects", async () => {
      (inspectionData.deleteInspection as jest.Mock).mockResolvedValue(undefined);
      await deleteInspection("insp-1");
      expect(inspectionData.deleteInspection).toHaveBeenCalledWith("insp-1");
      expectSuccessRedirect("/inspections", "Inspection deleted successfully.");
    });

    it("reports a failed inspection delete", async () => {
      (inspectionData.deleteInspection as jest.Mock).mockRejectedValue(new Error("boom"));
      const state = await deleteInspection("insp-1");
      expect(state).toEqual({
        status: "error",
        title: "Could not delete the inspection",
        message: "boom",
      });
      expectNoRedirect();
    });
  });
});
