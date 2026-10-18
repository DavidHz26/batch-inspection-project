import { getCurrentOrganizationId, requireOrganizationId } from "./organization";
import { calculateDefectPercentage, getInspectionStatus } from "./quality-calculator";
import { supabase } from "./supabase";
import { pageRange, type Paginated } from "./pagination";
import type { Inspection, InspectionInput, InspectionFilters } from "./types";

const INSPECTION_SELECT = "*, products(sku, name)";

export async function getInspections(
  filters: InspectionFilters = {},
  page: number = 1,
  pageSize: number = 10
): Promise<Paginated<Inspection>> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { data: [], count: 0 };

  const { from, to } = pageRange(page, pageSize);

  let query = supabase
    .from("inspections")
    .select(INSPECTION_SELECT, { count: "exact" })
    .eq("organization_id", organizationId)
    .order("inspection_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.productId) {
    query = query.eq("product_id", filters.productId);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(`Error while trying to get the organizations: ${error.message}`);
  return { data: data || [], count: count || 0 };
}

export async function getInspectionUnits(): Promise<
  Pick<Inspection, "units_inspected" | "units_defective">[]
> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  const { data, error } = await supabase
    .from("inspections")
    .select("units_inspected, units_defective")
    .eq("organization_id", organizationId);

  if (error) throw new Error(`Error while trying to get the insepections: ${error.message}`);
  return data || [];
}

export async function getInspection(id: string): Promise<Inspection | null> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return null;

  const { data, error } = await supabase
    .from("inspections")
    .select(INSPECTION_SELECT)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(`Error while trying to get the inspection: ${error.message}`);
  return data;
}

export async function insertInspection(
  input: InspectionInput
): Promise<Inspection> {
  const organizationId = await requireOrganizationId();

  const defect_percentage = calculateDefectPercentage(
    input.units_inspected,
    input.units_defective
  );

  const status = getInspectionStatus(defect_percentage);

  const { data, error } = await supabase
    .from("inspections")
    .insert({
      ...input,
      organization_id: organizationId,
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
  const organizationId = await requireOrganizationId();

  let calculatedFields = {};

  const unitsInspected = input.units_inspected !== undefined ? Number(input.units_inspected) : undefined;
  const unitsDefective = input.units_defective !== undefined ? Number(input.units_defective) : undefined;

  if (unitsInspected !== undefined && unitsDefective !== undefined && !isNaN(unitsInspected) && !isNaN(unitsDefective)) {
    const defect_percentage = calculateDefectPercentage(
      unitsInspected,
      unitsDefective
    );
    const status = getInspectionStatus(defect_percentage);
    calculatedFields = { 
      ...input, 
      units_inspected: unitsInspected, 
      units_defective: unitsDefective,
      defect_percentage, 
      status 
    };
  } else {
    calculatedFields = { ...input };
  }

  const { data, error } = await supabase
    .from("inspections")
    .update(calculatedFields)
    .eq("organization_id", organizationId)
    .eq("id", id)
    .select(INSPECTION_SELECT)
    .single();

  if (error) throw new Error(`Error while updating inspection: ${error.message}`);
  return data;
}

export async function deleteInspection(id: string): Promise<void> {
  const organizationId = await requireOrganizationId();
  const { error } = await supabase
    .from("inspections")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", id);

  if (error) throw new Error(`Error while deleting inspection: ${error.message}`);
}
