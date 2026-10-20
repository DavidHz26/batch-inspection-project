import { inspection } from "../helpers/fixtures";

jest.mock("@/lib/supabase", () => {
  const { createSupabaseMock } = jest.requireActual<
    typeof import("../helpers/supabase-mock")
  >("../helpers/supabase-mock");
  return { supabase: createSupabaseMock() };
});

jest.mock("@/lib/organization", () => ({
  getCurrentOrganizationId: jest.fn(async () => "org-1"),
  requireOrganizationId: jest.fn(async () => "org-1"),
}));

import { supabase } from "@/lib/supabase";
import { getCurrentOrganizationId, requireOrganizationId } from "@/lib/organization";
import {
  deleteInspection,
  getInspection,
  getInspections,
  getInspectionUnits,
  insertInspection,
  updateInspection,
} from "@/lib/inspections";

const mock = supabase as unknown as ReturnType<
  typeof import("../helpers/supabase-mock").createSupabaseMock
>;

describe("inspections data layer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mock.result.data = [];
    mock.result.error = null;
    mock.result.count = 0;
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
  });

  it("returns an empty page when no organization is selected", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);
    await expect(getInspections()).resolves.toEqual({ data: [], count: 0 });
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("applies product and status filters", async () => {
    mock.result.data = [inspection];
    mock.result.count = 1;
    await expect(
      getInspections({ product_id: "prod-1", status: "Approved" }, 1, 10),
    ).resolves.toEqual({ data: [inspection], count: 1 });
    expect(mock.builder.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(mock.builder.eq).toHaveBeenCalledWith("product_id", "prod-1");
    expect(mock.builder.eq).toHaveBeenCalledWith("status", "Approved");
  });

  it("loads the units of the current organization with filters", async () => {
    mock.result.data = [inspection];
    await expect(getInspectionUnits({ status: "Approved" })).resolves.toEqual([inspection]);
    expect(mock.builder.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(mock.builder.eq).toHaveBeenCalledWith("status", "Approved");
  });

  it("returns no units when no organization is selected", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);
    await expect(getInspectionUnits()).resolves.toEqual([]);
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("finds a single inspection only inside the current organization", async () => {
    mock.result.data = inspection;
    await expect(getInspection("insp-1")).resolves.toEqual(inspection);
    expect(mock.builder.eq).toHaveBeenCalledWith("id", "insp-1");
    expect(mock.builder.eq).toHaveBeenCalledWith("organization_id", "org-1");
  });

  it("returns no inspection when no organization is selected", async () => {
    (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);
    await expect(getInspection("insp-1")).resolves.toBeNull();
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("recomputes classification on insert", async () => {
    mock.result.data = inspection;
    await insertInspection({
      product_id: "prod-1",
      batch_number: "B-001",
      inspection_date: "2026-03-01",
      units_inspected: 100,
      units_defective: 2,
      defect_percentage: 99,
      status: "Rejected",
      inspector_name: null,
      notes: null,
    });
    expect(mock.builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: "org-1",
        defect_percentage: 2,
        status: "Approved",
      }),
    );
  });

  it("recomputes classification on update when units change", async () => {
    mock.result.data = inspection;
    await updateInspection("insp-1", {
      units_inspected: 10,
      units_defective: 2,
    });
    expect(mock.builder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        units_inspected: 10,
        units_defective: 2,
        defect_percentage: 20,
        status: "Rejected",
      }),
    );
  });

  it("ignores a client-sent status when units do not change", async () => {
    mock.result.data = inspection;
    await updateInspection("insp-1", {
      notes: "Checked",
      status: "Approved",
      defect_percentage: 0,
    });
    expect(mock.builder.update).toHaveBeenCalledWith({ notes: "Checked" });
  });

  it("updates an inspection only inside the current organization", async () => {
    mock.result.data = inspection;
    await updateInspection("insp-1", { notes: "Checked" });
    expect(mock.builder.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(mock.builder.eq).toHaveBeenCalledWith("id", "insp-1");
  });

  it("deletes an inspection only inside the current organization", async () => {
    await deleteInspection("insp-1");
    expect(mock.builder.delete).toHaveBeenCalled();
    expect(mock.builder.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(mock.builder.eq).toHaveBeenCalledWith("id", "insp-1");
  });

  it("does not touch the database when no organization is selected", async () => {
    (requireOrganizationId as jest.Mock).mockRejectedValueOnce(
      new Error("Select an organization to proceed"),
    );
    await expect(deleteInspection("insp-1")).rejects.toThrow(
      "Select an organization to proceed",
    );
    expect(mock.from).not.toHaveBeenCalled();
  });

  it("wraps database errors", async () => {
    mock.result.error = { message: "boom" };
    await expect(getInspection("insp-1")).rejects.toThrow(
      "Error while trying to get the inspection: boom",
    );
    await expect(getInspectionUnits()).rejects.toThrow(
      "Error while trying to get the inspections: boom",
    );
    await expect(deleteInspection("insp-1")).rejects.toThrow(
      "Error while deleting inspection: boom",
    );
  });
});
