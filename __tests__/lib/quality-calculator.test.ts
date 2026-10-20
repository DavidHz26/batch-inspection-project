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

  it("rejects missing, non-integer, or out-of-range units", () => {
    expect(() => classifyInspection("", 1)).toThrow(ValidationError);
    expect(() => classifyInspection(10.5, 1)).toThrow(/integer/);
    expect(() => classifyInspection(0, 0)).toThrow(/greater than 0/);
    expect(() => classifyInspection(10, 11)).toThrow(/between 0 and units_inspected/);
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

  it("returns a null percentage when there are no inspected units", () => {
    expect(calculateGlobalMetrics([])).toEqual({
      total_inspections: 0,
      total_inspected_units: 0,
      total_defective_units: 0,
      global_defect_percentage: null,
    });
  });
});
