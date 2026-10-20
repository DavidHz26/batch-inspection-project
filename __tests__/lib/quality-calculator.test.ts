import {
  calculateGlobalMetrics,
  classifyInspection,
  exactDefectPercentage,
  getInspectionStatus,
  isRoundingMisleading,
} from "@/lib/quality-calculator";
import { ValidationError } from "@/lib/errors";

describe("getInspectionStatus", () => {
  it("returns Approved at or below 5%", () => {
    expect(getInspectionStatus(0)).toBe("Approved");
    expect(getInspectionStatus(5)).toBe("Approved");
  });

  it("returns Observations above 5% and up to 10%", () => {
    expect(getInspectionStatus(5.01)).toBe("Observations");
    expect(getInspectionStatus(10)).toBe("Observations");
  });

  it("returns Rejected above 10%", () => {
    expect(getInspectionStatus(10.01)).toBe("Rejected");
  });
});

describe("classifyInspection", () => {
  it("classifies a valid inspection and rounds the percentage", () => {
    expect(classifyInspection(100, 2)).toEqual({
      units_inspected: 100,
      units_defective: 2,
      defect_percentage: 2,
      status: "Approved",
    });
  });

  it("parses numeric strings", () => {
    expect(classifyInspection("20", "1").status).toBe("Approved");
    expect(classifyInspection("20", "2").status).toBe("Observations");
  });

  // Casos obligatorios del requerimiento (revisadas/defectuosas).
  it.each([
    [20, 1, 5, "Approved"],
    [19, 1, 5.26, "Observations"],
    [10, 1, 10, "Observations"],
    [9, 1, 11.11, "Rejected"],
  ])("classifies %i/%i as %s%% -> %s", (inspected, defective, percentage, status) => {
    expect(classifyInspection(inspected, defective)).toEqual({
      units_inspected: inspected,
      units_defective: defective,
      defect_percentage: percentage,
      status,
    });
  });

  it("rejects zero inspected units", () => {
    expect(() => classifyInspection(0, 0)).toThrow(ValidationError);
    expect(() => classifyInspection(0, 0)).toThrow("units_inspected must be greater than 0");
  });

  it("rejects negative units", () => {
    expect(() => classifyInspection(-10, 0)).toThrow("units_inspected must be greater than 0");
    expect(() => classifyInspection(10, -1)).toThrow(
      "units_defective must be between 0 and units_inspected (inclusive)",
    );
  });

  it("rejects decimal units", () => {
    expect(() => classifyInspection(10.5, 1)).toThrow("units_inspected must be an integer");
    expect(() => classifyInspection(10, 1.5)).toThrow("units_defective must be an integer");
    expect(() => classifyInspection("10.5", "1")).toThrow("units_inspected must be an integer");
  });

  it.each([
    ["an empty string", ""],
    ["blank spaces", "   "],
    ["null", null],
    ["undefined", undefined],
  ])("rejects %s as an empty field", (_label, empty) => {
    expect(() => classifyInspection(empty, 1)).toThrow("units_inspected is required");
    expect(() => classifyInspection(10, empty)).toThrow("units_defective is required");
  });

  it("rejects more defective than inspected units", () => {
    expect(() => classifyInspection(10, 11)).toThrow(
      "units_defective must be between 0 and units_inspected (inclusive)",
    );
  });

  it("accepts the inclusive limits of defective units", () => {
    expect(classifyInspection(10, 0).status).toBe("Approved");
    expect(classifyInspection(10, 10).status).toBe("Rejected");
  });
});

describe("rounding helpers", () => {
  it("exposes a high-precision percentage", () => {
    expect(exactDefectPercentage(19, 1)).toBe(5.263158);
  });

  it("flags rounding that would change the status", () => {
    // 250/4999 = 5.001% (Observations) but displays as 5.00% (Approved)
    expect(isRoundingMisleading(4999, 250)).toBe(true);
    expect(isRoundingMisleading(100, 2)).toBe(false);
  });
});

describe("calculateGlobalMetrics", () => {
  it("aggregates units and the global defect percentage", () => {
    expect(
      calculateGlobalMetrics([
        { units_inspected: 100, units_defective: 2 },
        { units_inspected: 50, units_defective: 3 },
      ]),
    ).toEqual({
      total_inspections: 2,
      total_inspected_units: 150,
      total_defective_units: 5,
      global_defect_percentage: 3.33,
    });
  });

  // 100/0 y 10/2.
  // Global = (0 + 2) / (100 + 10) × 100 = 2 / 110 × 100 = 1.8181...% -> 1.82% (Approved).
  // Promediar porcentajes daría (0% + 20%) / 2 = 10% (Observations): el lote de 10 unidades
  // pesaría lo mismo que el de 100, aunque solo representa 10 de las 110 unidades revisadas.
  it("weights the global percentage by units instead of averaging percentages", () => {
    const inspections = [
      { units_inspected: 100, units_defective: 0 },
      { units_inspected: 10, units_defective: 2 },
    ];

    const metrics = calculateGlobalMetrics(inspections);
    expect(metrics).toEqual({
      total_inspections: 2,
      total_inspected_units: 110,
      total_defective_units: 2,
      global_defect_percentage: 1.82,
    });
    expect(getInspectionStatus(metrics.global_defect_percentage!)).toBe("Approved");

    const averaged_percentage =
      inspections
        .map((inspection) => classifyInspection(inspection.units_inspected, inspection.units_defective))
        .reduce((sum, inspection) => sum + inspection.defect_percentage, 0) / inspections.length;
    expect(averaged_percentage).toBe(10);
    expect(getInspectionStatus(averaged_percentage)).toBe("Observations");
  });

  // lista vacía == "No data"
  it("returns a null percentage when there are no inspected units", () => {
    expect(calculateGlobalMetrics([])).toEqual({
      total_inspections: 0,
      total_inspected_units: 0,
      total_defective_units: 0,
      global_defect_percentage: null,
    });
  });
});
