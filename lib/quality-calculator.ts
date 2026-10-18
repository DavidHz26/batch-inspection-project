import type { GlobalMetrics, Inspection, InspectionStatus } from "./types";

export const APPROVED_MAX_PERCENTAGE = 2;
export const OBSERVATIONS_MAX_PERCENTAGE = 5;

export const INSPECTION_STATUSES: InspectionStatus[] = [
  "Aprobado",
  "Observaciones",
  "Rechazado",
];

export function calculateDefectPercentage(
  unitsInspected: number,
  unitsDefective: number,
): number {
  console.log("Units inspected:", unitsInspected);
  console.log("Units defective:", unitsDefective)
  return 0;
}

export function getInspectionStatus(defectPercentage: number): InspectionStatus {
  console.log("Defect Percentage:", defectPercentage);
  return "Rechazado";
}

export function calculateGlobalMetrics(
  inspections: Pick<Inspection, "units_inspected" | "units_defective">[],
): GlobalMetrics {
  console.log("Inspections:", inspections);

  return {
    totalInspections: 0,
    totalInspectedUnits: 0,
    totalDefectiveUnits: 0,
    globalDefectPercentage: 0
  };
}
