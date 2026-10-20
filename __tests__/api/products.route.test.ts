/**
 * @jest-environment node
 */
import { emptyRequest, jsonRequest, routeContext } from "../helpers/api";
import { product } from "../helpers/fixtures";

jest.mock("@/lib/organization", () => ({
  getCurrentOrganizationId: jest.fn(),
}));

jest.mock("@/lib/products", () => ({
  getProducts: jest.fn(),
  getProduct: jest.fn(),
  insertProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

import { getCurrentOrganizationId } from "@/lib/organization";
import {
  deleteProduct,
  getProduct,
  getProducts,
  insertProduct,
  updateProduct,
} from "@/lib/products";
import { GET as listGet, POST as listPost } from "@/app/api/products/route";
import { DELETE, GET, PUT } from "@/app/api/products/[id]/route";

const ctx = routeContext("prod-1");

describe("products API", () => {
  beforeEach(() => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
  });

  it("lists products for the current organization", async () => {
    (getProducts as jest.Mock).mockResolvedValue([product]);
    const response = await listGet();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([product]);
  });

  it("returns 400 when no organization is selected", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);
    const response = await listGet();
    expect(response.status).toBe(400);
  });

  it("creates a product", async () => {
    (insertProduct as jest.Mock).mockResolvedValue(product);
    const response = await listPost(
      jsonRequest("POST", { sku: "P001", name: "Widget" }),
    );
    expect(response.status).toBe(201);
  });

  it("returns 404 when the product is missing", async () => {
    (getProduct as jest.Mock).mockResolvedValue(null);
    const response = await GET(emptyRequest, ctx);
    expect(response.status).toBe(404);
  });

  it("updates and deletes an existing product", async () => {
    (getProduct as jest.Mock).mockResolvedValue(product);
    (updateProduct as jest.Mock).mockResolvedValue({ ...product, name: "Updated" });
    (deleteProduct as jest.Mock).mockResolvedValue(undefined);

    const updated = await PUT(
      jsonRequest("PUT", { sku: "P001", name: "Updated" }),
      ctx,
    );
    expect(updated.status).toBe(200);

    const deleted = await DELETE(emptyRequest, ctx);
    expect(deleted.status).toBe(204);
  });
});

describe("products API error handling", () => {
  let console_error: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
    console_error = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console_error.mockRestore();
  });

  it("rejects creating a product without an organization", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);
    const response = await listPost(jsonRequest("POST", { sku: "P001", name: "Widget" }));
    expect(response.status).toBe(400);
    expect(insertProduct).not.toHaveBeenCalled();
  });

  it("returns 400 for a body that is not JSON", async () => {
    const response = await listPost(
      jsonRequest("POST", "not json"),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "The request body must be a JSON object",
    });
  });

  it("returns 400 when a required field is missing", async () => {
    const response = await listPost(jsonRequest("POST", { name: "Widget" }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "sku is required" });
  });

  it("returns 500 without leaking database details when insert fails", async () => {
    (insertProduct as jest.Mock).mockRejectedValue(new Error("duplicate key"));
    const response = await listPost(jsonRequest("POST", { sku: "P001", name: "Widget" }));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Could not create the product" });
  });

  it("returns 400 on single product routes without an organization", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);
    const response = await GET(emptyRequest, ctx);
    expect(response.status).toBe(400);
    expect(getProduct).not.toHaveBeenCalled();
  });

  it("looks up the product inside the current organization", async () => {
    (getProduct as jest.Mock).mockResolvedValue(product);
    const response = await GET(emptyRequest, ctx);
    expect(response.status).toBe(200);
    expect(getProduct).toHaveBeenCalledWith("org-1", "prod-1");
  });

  it("keeps the current active flag when the update omits it", async () => {
    (getProduct as jest.Mock).mockResolvedValue({ ...product, is_active: false });
    (updateProduct as jest.Mock).mockResolvedValue(product);
    await PUT(jsonRequest("PUT", { sku: "P001", name: "Widget" }), ctx);
    expect(updateProduct).toHaveBeenCalledWith("prod-1", {
      sku: "P001",
      name: "Widget",
      is_active: false,
    });
  });

  it("returns 404 before updating or deleting a missing product", async () => {
    (getProduct as jest.Mock).mockResolvedValue(null);
    const updated = await PUT(jsonRequest("PUT", { sku: "P001", name: "X" }), ctx);
    const deleted = await DELETE(emptyRequest, ctx);
    expect(updated.status).toBe(404);
    expect(deleted.status).toBe(404);
    expect(updateProduct).not.toHaveBeenCalled();
    expect(deleteProduct).not.toHaveBeenCalled();
  });

  it("returns 400 when the update is invalid", async () => {
    (getProduct as jest.Mock).mockResolvedValue(product);
    const response = await PUT(jsonRequest("PUT", { sku: "P001" }), ctx);
    expect(response.status).toBe(400);
    expect(updateProduct).not.toHaveBeenCalled();
  });

  it("returns 500 when the update or delete fails", async () => {
    (getProduct as jest.Mock).mockResolvedValue(product);
    (updateProduct as jest.Mock).mockRejectedValue(new Error("boom"));
    (deleteProduct as jest.Mock).mockRejectedValue(
      new Error("Cant delete a product associated with an inspection."),
    );

    const updated = await PUT(jsonRequest("PUT", { sku: "P001", name: "X" }), ctx);
    expect(updated.status).toBe(500);
    await expect(updated.json()).resolves.toEqual({ error: "Could not update the product" });

    const deleted = await DELETE(emptyRequest, ctx);
    expect(deleted.status).toBe(500);
    await expect(deleted.json()).resolves.toEqual({ error: "Could not delete the product" });
  });
});
