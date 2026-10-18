import type { GlobalMetrics, Inspection, InspectionStatus } from "./types";

export const APPROVED_MAX_PERCENTAGE = 5;
export const OBSERVATIONS_MAX_PERCENTAGE = 10;
export const INSPECTION_STATUSES: InspectionStatus[] = [
  "Approved",
  "Observations",
  "Rejected",
];

export function calculateDefectPercentage(unitsInspected: number, unitsDefective: number): number {
  if (!Number.isInteger(unitsInspected) || !Number.isInteger(unitsDefective)) {
    throw new Error("Quantities must be integer numbers.");
  }
  if (unitsInspected <= 0) {
    throw new Error("Inspected units must be greater than zero.");
  }
  if (unitsDefective < 0) {
    throw new Error("Defective units cannot be negative.");
  }
  if (unitsDefective > unitsInspected) {
    throw new Error("Defective units cannot be greater than inspected units.");
  }

  const percentage = (unitsDefective / unitsInspected) * 100;
  return Number(percentage.toFixed(2));
}

export function getInspectionStatus(defectPercentage: number): InspectionStatus {
  if (defectPercentage <= APPROVED_MAX_PERCENTAGE) {
    return "Approved";
  } else if (defectPercentage <= OBSERVATIONS_MAX_PERCENTAGE) {
    return "Observations";
  } else {
    return "Rejected";
  }
}

export function calculateGlobalMetrics(
  inspections: Pick<Inspection, "units_inspected" | "units_defective">[],
): GlobalMetrics {
  const totalInspections = inspections.length;

  if (totalInspections === 0) {
    return {
      totalInspections: 0,
      totalInspectedUnits: 0,
      totalDefectiveUnits: 0,
      globalDefectPercentage: 0,
    };
  }

  let totalInspectedUnits = 0;
  let totalDefectiveUnits = 0;

  for (const inspection of inspections) {
    totalInspectedUnits += inspection.units_inspected;
    totalDefectiveUnits += inspection.units_defective;
  }

  const globalDefectPercentage =
    totalInspectedUnits > 0
      ? Number(((totalDefectiveUnits / totalInspectedUnits) * 100).toFixed(2))
      : 0;

  return {
    totalInspections,
    totalInspectedUnits,
    totalDefectiveUnits,
    globalDefectPercentage,
  };
}
