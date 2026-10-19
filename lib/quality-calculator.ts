import type { GlobalMetrics, Inspection, InspectionStatus } from "./types";

export const APPROVED_MAX_PERCENTAGE = 5;
export const OBSERVATIONS_MAX_PERCENTAGE = 10;
export const INSPECTION_STATUSES: InspectionStatus[] = [
  "Approved",
  "Observations",
  "Rejected",
];

export function calculateDefectPercentage(units_inspected: number, units_defective: number): number {
  if (!Number.isInteger(units_inspected) || !Number.isInteger(units_defective)) {
    throw new Error("Quantities must be integer numbers.");
  }
  if (units_inspected <= 0) {
    throw new Error("Inspected units must be greater than zero.");
  }
  if (units_defective < 0) {
    throw new Error("Defective units cannot be negative.");
  }
  if (units_defective > units_inspected) {
    throw new Error("Defective units cannot be greater than inspected units.");
  }

  const percentage = (units_defective / units_inspected) * 100;
  return Number(percentage.toFixed(2));
}

export function getInspectionStatus(defect_percentage: number): InspectionStatus {
  if (defect_percentage <= APPROVED_MAX_PERCENTAGE) {
    return "Approved";
  } else if (defect_percentage <= OBSERVATIONS_MAX_PERCENTAGE) {
    return "Observations";
  } else {
    return "Rejected";
  }
}

export function calculateGlobalMetrics(
  inspections: Pick<Inspection, "units_inspected" | "units_defective">[],
): GlobalMetrics {
  const total_inspections = inspections.length;

  if (total_inspections === 0) {
    return {
      total_inspections: 0,
      total_inspected_units: 0,
      total_defective_units: 0,
      global_defect_percentage: 0,
    };
  }

  let total_inspected_units = 0;
  let total_defective_units = 0;

  for (const inspection of inspections) {
    total_inspected_units += inspection.units_inspected;
    total_defective_units += inspection.units_defective;
  }

  const global_defect_percentage =
    total_inspected_units > 0
      ? Number(((total_defective_units / total_inspected_units) * 100).toFixed(2))
      : 0;

  return {
    total_inspections,
    total_inspected_units,
    total_defective_units,
    global_defect_percentage,
  };
}
