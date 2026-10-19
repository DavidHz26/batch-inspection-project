import { ValidationError } from "./errors";
import { classifyInspection } from "./quality-calculator";
import type { InspectionInput, OrganizationInput, ProductInput } from "./types";

export { ValidationError };

type Values = Record<string, unknown>;

export function formValues(form_data: FormData): Values {
  return Object.fromEntries(form_data);
}

function text(values: Values, key: string): string {
  const value = values[key];
  return typeof value === "string" ? value.trim() : "";
}

function requiredText(values: Values, key: string): string {
  const value = values[key];

  if (value !== undefined && value !== null && typeof value !== "string") {
    throw new ValidationError(`${key} must be text`);
  }

  const trimmed = text(values, key);
  if (!trimmed) throw new ValidationError(`${key} is required`);

  return trimmed;
}


const DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

function date(values: Values, key: string): string {
  const value = requiredText(values, key);
  const match = DATE_PATTERN.exec(value);

  if (!match) {
    throw new ValidationError(`${key} must be a valid date (YYYY-MM-DD)`);
  }

  const [year, month, day] = match.slice(1, 4).map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  const is_real_day =
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  if (!is_real_day || Number.isNaN(Date.parse(value.replace(" ", "T")))) {
    throw new ValidationError(`${key} must be a valid date (YYYY-MM-DD)`);
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
  { is_active_default = true } = {},
): ProductInput {
  return {
    sku: requiredText(values, "sku"),
    name: requiredText(values, "name"),
    is_active: bool(values, "is_active", is_active_default),
  };
}

// El lote es texto, la fecha es válida y las unidades las valida y clasifica classifyInspection (enteros, revisadas > 0, 0 <= defectuosas <= revisadas).
export function parseInspection(values: Values): InspectionInput {
  const { units_inspected, units_defective, defect_percentage, status } =
    classifyInspection(values.units_inspected, values.units_defective);

  return {
    product_id: requiredText(values, "product_id"),
    batch_number: requiredText(values, "batch_number"),
    inspection_date: date(values, "inspection_date"),
    units_inspected,
    units_defective,
    defect_percentage,
    status,
    inspector_name: text(values, "inspector_name") || null,
    notes: text(values, "notes") || null,
  };
}
