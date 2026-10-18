import { getCurrentOrganizationId, requireOrganizationId } from "./organization";
import { supabase } from "./supabase";
import type { Inspection, InspectionInput, InspectionFilters } from "./types";

const INSPECTION_SELECT = "*, products(sku, name)";

export async function getInspections(
  filters: InspectionFilters = {}
): Promise<Inspection[]> {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return [];

  let query = supabase
    .from("inspections")
    .select(INSPECTION_SELECT)
    .eq("organization_id", organizationId)
    .order("inspection_date", { ascending: false });

  if (filters.productId) {
    query = query.eq("product_id", filters.productId);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Error al cargar inspecciones: ${error.message}`);
  return data || [];
}

export async function getInspection(id: string): Promise<Inspection | null> {
  const { data, error } = await supabase
    .from("inspections")
    .select(INSPECTION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Error al cargar la inspección: ${error.message}`);
  return data;
}

export async function insertInspection(
  input: InspectionInput
): Promise<Inspection> {
  const organizationId = await requireOrganizationId();
  const { data, error } = await supabase
    .from("inspections")
    .insert({ ...input, organization_id: organizationId })
    .select(INSPECTION_SELECT)
    .single();

  if (error) throw new Error(`Error al registrar inspección: ${error.message}`);
  return data;
}

export async function updateInspection(
  id: string,
  input: Partial<InspectionInput>
): Promise<Inspection> {
  const organizationId = await requireOrganizationId();
  const { data, error } = await supabase
    .from("inspections")
    .update(input)
    .eq("organization_id", organizationId)
    .eq("id", id)
    .select(INSPECTION_SELECT)
    .single();

  if (error) throw new Error(`Error al actualizar inspección: ${error.message}`);
  return data;
}

export async function deleteInspection(id: string): Promise<void> {
  const organizationId = await requireOrganizationId();
  const { error } = await supabase
    .from("inspections")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", id);

  if (error) throw new Error(`Error al eliminar inspección: ${error.message}`);
}
