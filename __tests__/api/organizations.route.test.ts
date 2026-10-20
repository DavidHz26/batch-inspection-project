/**
 * @jest-environment node
 */
import { emptyRequest, jsonRequest, routeContext } from "../helpers/api";
import { org } from "../helpers/fixtures";

jest.mock("@/lib/organization", () => ({
  getOrganizations: jest.fn(),
  getOrganization: jest.fn(),
  insertOrganization: jest.fn(),
  updateOrganization: jest.fn(),
  deleteOrganization: jest.fn(),
}));

import {
  deleteOrganization,
  getOrganization,
  getOrganizations,
  insertOrganization,
  updateOrganization,
} from "@/lib/organization";
import { GET as listGet, POST as listPost } from "@/app/api/organizations/route";
import {
  DELETE,
  GET,
  PUT,
} from "@/app/api/organizations/[id]/route";

const ctx = routeContext("org-1");

describe("GET /api/organizations", () => {
  it("returns the organization list", async () => {
    (getOrganizations as jest.Mock).mockResolvedValue([org]);
    const response = await listGet();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([org]);
  });
});

describe("POST /api/organizations", () => {
  it("creates an organization", async () => {
    (insertOrganization as jest.Mock).mockResolvedValue(org);
    const response = await listPost(jsonRequest("POST", { name: "Acme" }));
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual(org);
  });

  it("returns 400 when the name is missing", async () => {
    const response = await listPost(jsonRequest("POST", {}));
    expect(response.status).toBe(400);
  });
});

describe("GET /api/organizations/[id]", () => {
  it("returns 404 when missing", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(null);
    const response = await GET(emptyRequest, ctx);
    expect(response.status).toBe(404);
  });
});

describe("PUT /api/organizations/[id]", () => {
  it("updates an existing organization", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(org);
    (updateOrganization as jest.Mock).mockResolvedValue({ ...org, name: "New" });
    const response = await PUT(jsonRequest("PUT", { name: "New" }), ctx);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ name: "New" });
  });
});

describe("DELETE /api/organizations/[id]", () => {
  it("returns 204 after a successful delete", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(org);
    (deleteOrganization as jest.Mock).mockResolvedValue(undefined);
    const response = await DELETE(emptyRequest, ctx);
    expect(response.status).toBe(204);
  });
});

describe("organizations API error handling", () => {
  let console_error: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    console_error = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console_error.mockRestore();
  });

  it("returns an existing organization", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(org);
    const response = await GET(emptyRequest, ctx);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(org);
  });

  it("returns 500 when creating an organization fails", async () => {
    (insertOrganization as jest.Mock).mockRejectedValue(new Error("duplicate key"));
    const response = await listPost(jsonRequest("POST", { name: "Acme" }));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Could not create the organization",
    });
  });

  it("returns 404 before updating or deleting a missing organization", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(null);
    const updated = await PUT(jsonRequest("PUT", { name: "New" }), ctx);
    const deleted = await DELETE(emptyRequest, ctx);
    expect(updated.status).toBe(404);
    expect(deleted.status).toBe(404);
    expect(updateOrganization).not.toHaveBeenCalled();
    expect(deleteOrganization).not.toHaveBeenCalled();
  });

  it("returns 400 when the update has a blank name", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(org);
    const response = await PUT(jsonRequest("PUT", { name: "  " }), ctx);
    expect(response.status).toBe(400);
    expect(updateOrganization).not.toHaveBeenCalled();
  });

  it("returns 500 when the update or delete fails", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(org);
    (updateOrganization as jest.Mock).mockRejectedValue(new Error("boom"));
    (deleteOrganization as jest.Mock).mockRejectedValue(new Error("boom"));

    const updated = await PUT(jsonRequest("PUT", { name: "New" }), ctx);
    expect(updated.status).toBe(500);
    await expect(updated.json()).resolves.toEqual({
      error: "Could not update the organization",
    });

    const deleted = await DELETE(emptyRequest, ctx);
    expect(deleted.status).toBe(500);
    await expect(deleted.json()).resolves.toEqual({
      error: "Could not delete the organization",
    });
  });
});
