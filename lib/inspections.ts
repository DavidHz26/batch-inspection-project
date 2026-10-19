import { getCurrentOrganizationId, requireOrganizationId } from "./organization";
import { calculateDefectPercentage, getInspectionStatus } from "./quality-calculator";
import { supabase } from "./supabase";
import { pageRange, type Paginated } from "./pagination";
import type { Inspection, InspectionInput, InspectionFilters } from "./types";

const INSPECTION_SELECT = "*, products(sku, name)";

function filterConditions(filters: InspectionFilters): [column: string, value: string][] {
  const conditions: [string, string][] = [];
  if (filters.product_id) conditions.push(["product_id", filters.product_id]);
  if (filters.status) conditions.push(["status", filters.status]);
  return conditions;
}

export async function getInspections(
  filters: InspectionFilters = {},
  page: number = 1,
  page_size: number = 10
): Promise<Paginated<Inspection>> {
  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) return { data: [], count: 0 };

  const { from, to } = pageRange(page, page_size);

  let query = supabase
    .from("inspections")
    .select(INSPECTION_SELECT, { count: "exact" })
    .eq("organization_id", organization_id);
  for (const [column, value] of filterConditions(filters)) {
    query = query.eq(column, value);
  }

  const { data, error, count } = await query
    .order("inspection_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(`Error while trying to get the inspections: ${error.message}`);
  return { data: data || [], count: count || 0 };
}

export async function getInspectionUnits(
  filters: InspectionFilters = {},
): Promise<Pick<Inspection, "units_inspected" | "units_defective">[]> {
  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) return [];

  let query = supabase
    .from("inspections")
    .select("units_inspected, units_defective")
    .eq("organization_id", organization_id);
  for (const [column, value] of filterConditions(filters)) {
    query = query.eq(column, value);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Error while trying to get the insepections: ${error.message}`);
  return data || [];
}

export async function getInspection(id: string): Promise<Inspection | null> {
  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) return null;

  const { data, error } = await supabase
    .from("inspections")
    .select(INSPECTION_SELECT)
    .eq("id", id)
    .eq("organization_id", organization_id)
    .maybeSingle();

  if (error) throw new Error(`Error while trying to get the inspection: ${error.message}`);
  return data;
}

export async function insertInspection(
  input: InspectionInput
): Promise<Inspection> {
  const organization_id = await requireOrganizationId();

  const defect_percentage = calculateDefectPercentage(
    input.units_inspected,
    input.units_defective
  );

  const status = getInspectionStatus(defect_percentage);

  const { data, error } = await supabase
    .from("inspections")
    .insert({
      ...input,
      organization_id: organization_id,
      defect_percentage,
      status,
    })
    .select(INSPECTION_SELECT)
    .single();

  if (error) throw new Error(`Error while registering inspection: ${error.message}`);
  return data;
}

export async function updateInspection(
  id: string,
  input: Partial<InspectionInput>
): Promise<Inspection> {
  const organization_id = await requireOrganizationId();

  let calculated_fields = {};

  const units_inspected = input.units_inspected !== undefined ? Number(input.units_inspected) : undefined;
  const units_defective = input.units_defective !== undefined ? Number(input.units_defective) : undefined;

  if (units_inspected !== undefined && units_defective !== undefined && !isNaN(units_inspected) && !isNaN(units_defective)) {
    const defect_percentage = calculateDefectPercentage(
      units_inspected,
      units_defective
    );
    const status = getInspectionStatus(defect_percentage);
    calculated_fields = { 
      ...input, 
      units_inspected: units_inspected, 
      units_defective: units_defective,
      defect_percentage, 
      status 
    };
  } else {
    calculated_fields = { ...input };
  }

  const { data, error } = await supabase
    .from("inspections")
    .update(calculated_fields)
    .eq("organization_id", organization_id)
    .eq("id", id)
    .select(INSPECTION_SELECT)
    .single();

  if (error) throw new Error(`Error while updating inspection: ${error.message}`);
  return data;
}

export async function deleteInspection(id: string): Promise<void> {
  const organization_id = await requireOrganizationId();
  const { error } = await supabase
    .from("inspections")
    .delete()
    .eq("organization_id", organization_id)
    .eq("id", id);

  if (error) throw new Error(`Error while deleting inspection: ${error.message}`);
}
