import { ValidationError } from "./errors";
import type { GlobalMetrics, Inspection, InspectionStatus } from "./types";

export const APPROVED_MAX_PERCENTAGE = 5;
export const OBSERVATIONS_MAX_PERCENTAGE = 10;

export const INSPECTION_STATUSES: InspectionStatus[] = [
  "Approved",
  "Observations",
  "Rejected",
];

export interface InspectionClassification {
  units_inspected: number;
  units_defective: number;
  defect_percentage: number;
  status: InspectionStatus;
}

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

function toUnits(value: unknown, field: string): number {
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    throw new ValidationError(`${field} is required`);
  }

  const units =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;

  if (!Number.isInteger(units)) {
    throw new ValidationError(`${field} must be an integer`);
  }
  return units;
}

// Resultado segun el porcentaje exacto de defectos.
export function getInspectionStatus(exact_percentage: number): InspectionStatus {
  if (exact_percentage <= APPROVED_MAX_PERCENTAGE) return "Approved";
  if (exact_percentage <= OBSERVATIONS_MAX_PERCENTAGE) return "Observations";
  return "Rejected";
}

export function classifyInspection(
  units_inspected: unknown,
  units_defective: unknown,
): InspectionClassification {
  const inspected = toUnits(units_inspected, "units_inspected");
  const defective = toUnits(units_defective, "units_defective");

  if (inspected <= 0) {
    throw new ValidationError("units_inspected must be greater than 0");
  }
  if (defective < 0 || defective > inspected) {
    throw new ValidationError(
      "units_defective must be between 0 and units_inspected (inclusive)",
    );
  }

  const exact_percentage = (defective / inspected) * 100;

  return {
    units_inspected: inspected,
    units_defective: defective,
    defect_percentage: roundPercentage(exact_percentage),
    status: getInspectionStatus(exact_percentage),
  };
}

// Calcula el porcentaje de defectos con alta precisión (6 decimales).
export function exactDefectPercentage(units_inspected: number, units_defective: number): number {
  return Number(((units_defective / units_inspected) * 100).toFixed(6));
}

// Indica si el redondeo visual difiere del estado real y requiere mostrar el valor exacto.
export function isRoundingMisleading(units_inspected: number, units_defective: number): boolean {
  const exact_percentage = (units_defective / units_inspected) * 100;
  return getInspectionStatus(roundPercentage(exact_percentage)) !== getInspectionStatus(exact_percentage);
}

export function calculateGlobalMetrics(
  inspections: Pick<Inspection, "units_inspected" | "units_defective">[],
): GlobalMetrics {
  let total_inspected_units = 0;
  let total_defective_units = 0;

  for (const inspection of inspections) {
    total_inspected_units += inspection.units_inspected;
    total_defective_units += inspection.units_defective;
  }

  return {
    total_inspections: inspections.length,
    total_inspected_units,
    total_defective_units,
    global_defect_percentage:
      total_inspected_units > 0
        ? roundPercentage((total_defective_units / total_inspected_units) * 100)
        : null,
  };
}
