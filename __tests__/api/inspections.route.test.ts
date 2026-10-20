/**
 * @jest-environment node
 */
import { inspection } from "../helpers/fixtures";

jest.mock("@/lib/organization", () => ({
  getCurrentOrganizationId: jest.fn(),
}));

jest.mock("@/lib/inspections", () => ({
  getInspections: jest.fn(),
  insertInspection: jest.fn(),
}));

import { getCurrentOrganizationId } from "@/lib/organization";
import { getInspections, insertInspection } from "@/lib/inspections";
import { GET, POST } from "@/app/api/inspections/route";

describe("inspections API", () => {
  it("returns 400 without an organization", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(400);
  });

  it("lists inspections", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
    (getInspections as jest.Mock).mockResolvedValue({ data: [inspection], count: 1 });
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: [inspection], count: 1 });
  });

  it("creates an inspection", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
    (insertInspection as jest.Mock).mockResolvedValue(inspection);
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          product_id: "prod-1",
          batch_number: "B-001",
          inspection_date: "2026-03-01",
          units_inspected: 100,
          units_defective: 2,
        }),
      }),
    );
    expect(response.status).toBe(201);
    expect(insertInspection).toHaveBeenCalled();
  });
});

describe("inspections API error handling", () => {
  const valid_body = {
    product_id: "prod-1",
    batch_number: "B-001",
    inspection_date: "2026-03-01",
    units_inspected: 100,
    units_defective: 2,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
  });

  function postRequest(body: unknown) {
    return new Request("http://localhost", { method: "POST", body: JSON.stringify(body) });
  }

  it("rejects creating an inspection without an organization", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);
    const response = await POST(postRequest(valid_body));
    expect(response.status).toBe(400);
    expect(insertInspection).not.toHaveBeenCalled();
  });

  it("returns 400 when defective units exceed inspected units", async () => {
    const response = await POST(postRequest({ ...valid_body, units_defective: 101 }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "units_defective must be between 0 and units_inspected (inclusive)",
    });
    expect(insertInspection).not.toHaveBeenCalled();
  });

  it("returns 400 for an impossible date", async () => {
    const response = await POST(postRequest({ ...valid_body, inspection_date: "2026-02-30" }));
    expect(response.status).toBe(400);
    expect(insertInspection).not.toHaveBeenCalled();
  });

  it("returns 500 when the insert fails", async () => {
    const console_error = jest.spyOn(console, "error").mockImplementation(() => {});
    (insertInspection as jest.Mock).mockRejectedValue(new Error("boom"));
    const response = await POST(postRequest(valid_body));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Could not create the inspection" });
    console_error.mockRestore();
  });
});
