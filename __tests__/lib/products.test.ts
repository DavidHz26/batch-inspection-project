import { product } from "../helpers/fixtures";

jest.mock("@/lib/supabase", () => {
  const { createSupabaseMock } = jest.requireActual<
    typeof import("../helpers/supabase-mock")
  >("../helpers/supabase-mock");
  return { supabase: createSupabaseMock() };
});

jest.mock("@/lib/organization", () => ({
  requireOrganizationId: jest.fn(async () => "org-1"),
}));

import { type MockSupabase } from "../helpers/supabase-mock";
import { supabase } from "@/lib/supabase";
import { requireOrganizationId } from "@/lib/organization";
import {
  deleteProduct,
  getProduct,
  getProducts,
  getProductsPage,
  insertProduct,
  updateProduct,
} from "@/lib/products";

const mock = supabase as unknown as MockSupabase;

describe("products data layer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mock.result.data = [];
    mock.result.error = null;
    mock.result.count = 0;
  });

  it("lists products for an organization", async () => {
    mock.result.data = [product];
    await expect(getProducts("org-1")).resolves.toEqual([product]);
    expect(mock.builder.eq).toHaveBeenCalledWith("organization_id", "org-1");
  });

  it("pages products of an organization with the total count", async () => {
    mock.result.data = [product];
    mock.result.count = 21;
    await expect(getProductsPage("org-1", 3, 10)).resolves.toEqual({
      data: [product],
      count: 21,
    });
    expect(mock.builder.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(mock.builder.range).toHaveBeenCalledWith(20, 29);
  });

  it("finds a single product only inside the given organization", async () => {
    mock.result.data = product;
    await expect(getProduct("org-1", "prod-1")).resolves.toEqual(product);
    expect(mock.builder.eq).toHaveBeenCalledWith("id", "prod-1");
    expect(mock.builder.eq).toHaveBeenCalledWith("organization_id", "org-1");
  });

  it("inserts a product scoped to the current organization", async () => {
    mock.result.data = product;
    await expect(
      insertProduct({ sku: "P001", name: "Widget", is_active: true }),
    ).resolves.toEqual(product);
    expect(mock.builder.insert).toHaveBeenCalledWith({
      sku: "P001",
      name: "Widget",
      is_active: true,
      organization_id: "org-1",
    });
  });

  it("updates a product only inside the current organization", async () => {
    mock.result.data = { ...product, name: "Updated" };
    await updateProduct("prod-1", { name: "Updated" });
    expect(mock.builder.update).toHaveBeenCalledWith({ name: "Updated" });
    expect(mock.builder.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(mock.builder.eq).toHaveBeenCalledWith("id", "prod-1");
  });

  it("deletes a product only inside the current organization", async () => {
    await deleteProduct("prod-1");
    expect(mock.builder.delete).toHaveBeenCalled();
    expect(mock.builder.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(mock.builder.eq).toHaveBeenCalledWith("id", "prod-1");
  });

  it("does not touch the database when no organization is selected", async () => {
    (requireOrganizationId as jest.Mock).mockRejectedValueOnce(
      new Error("Select an organization to proceed"),
    );
    await expect(deleteProduct("prod-1")).rejects.toThrow(
      "Select an organization to proceed",
    );
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("blocks deleting a product that still has inspections", async () => {
    mock.result.error = { message: "fk", code: "23503" };
    await expect(deleteProduct("prod-1")).rejects.toThrow(
      "Cant delete a product associated with an inspection.",
    );
  });

  it("wraps other database errors", async () => {
    mock.result.error = { message: "boom" };
    await expect(getProduct("org-1", "prod-1")).rejects.toThrow(
      "Error while fetching single product: boom",
    );
    await expect(updateProduct("prod-1", { name: "X" })).rejects.toThrow(
      "Error while trying to update a product: boom",
    );
    await expect(deleteProduct("prod-1")).rejects.toThrow(
      "Error while trying to delete a product: boom",
    );
  });
});
