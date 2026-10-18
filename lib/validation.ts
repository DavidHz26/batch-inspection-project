import {
  calculateDefectPercentage,
  getInspectionStatus,
} from "./quality-calculator";
import type { InspectionInput, OrganizationInput, ProductInput } from "./types";

export class ValidationError extends Error {}

type Values = Record<string, unknown>;

export function formValues(formData: FormData): Values {
  return Object.fromEntries(formData);
}

function text(values: Values, key: string): string {
  const value = values[key];
  return typeof value === "string" ? value.trim() : "";
}

function requiredText(values: Values, key: string): string {
  const value = text(values, key);
  if (!value) throw new ValidationError(`El campo ${key} es obligatorio`);
  return value;
}

function int(values: Values, key: string): number {
  const value = Number(values[key]);
  if (!Number.isInteger(value) || value < 0) {
    throw new ValidationError(`Valor inválido para ${key}`);
  }
  return value;
}

function bool(values: Values, key: string, fallback: boolean): boolean {
  const value = values[key];
  if (typeof value === "boolean") return value;
  if (value === "on" || value === "true") return true;
  if (value === undefined) return fallback;
  return false;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseOrganization(values: Values): OrganizationInput {
  const name = requiredText(values, "name");
  return { name, slug: slugify(text(values, "slug") || name) };
}

export function parseProduct(
  values: Values,
  { isActiveDefault = true } = {},
): ProductInput {
  return {
    sku: requiredText(values, "sku"),
    name: requiredText(values, "name"),
    is_active: bool(values, "is_active", isActiveDefault),
  };
}

export function parseInspection(values: Values): InspectionInput {
  const unitsInspected = int(values, "units_inspected");
  const unitsDefective = int(values, "units_defective");
  if (unitsInspected === 0) {
    throw new ValidationError("units_inspected muist be greater than 0");
  }
  if (unitsDefective > unitsInspected) {
    throw new ValidationError("units_defective cant be greater than units_inspected");
  }

  const defectPercentage = calculateDefectPercentage(
    unitsInspected,
    unitsDefective,
  );

  return {
    product_id: requiredText(values, "product_id"),
    batch_number: requiredText(values, "batch_number"),
    inspection_date: requiredText(values, "inspection_date"),
    units_inspected: unitsInspected,
    units_defective: unitsDefective,
    defect_percentage: defectPercentage,
    status: getInspectionStatus(defectPercentage),
    inspector_name: text(values, "inspector_name") || null,
    notes: text(values, "notes") || null,
  };
}
