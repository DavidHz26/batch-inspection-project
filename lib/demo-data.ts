import { supabase } from "./supabase";
import { classifyInspection } from "./quality-calculator";

// Peligroso al manipular los datos, solo están disponibles si el servidor lo habilita con DEMO_DATA_ENABLED=true
export function isDemoDataEnabled(): boolean {
  return process.env.DEMO_DATA_ENABLED === "true";
}

const DEMO_INSPECTIONS: {
  sku: string;
  batch_number: string;
  days_ago: number;
  units_inspected: number;
  units_defective: number;
  inspector_name: string;
}[] = [
  // Casos obligatorios del requerimiento (revisadas/defectuosas)
  { sku: "P001", batch_number: "L-2026-101", days_ago: 0, units_inspected: 20, units_defective: 1, inspector_name: "Ana Gómez" }, // 5% -> Approved
  { sku: "P002", batch_number: "L-2026-102", days_ago: 0, units_inspected: 19, units_defective: 1, inspector_name: "Carlos Pérez" }, // 5.26% -> Observations
  { sku: "P003", batch_number: "L-2026-103", days_ago: 1, units_inspected: 10, units_defective: 1, inspector_name: "María López" }, // 10% -> Observations
  { sku: "P004", batch_number: "L-2026-104", days_ago: 1, units_inspected: 9, units_defective: 1, inspector_name: "Ana Gómez" }, // 11.11% -> Rejected
  // Caso global: 100/0 + 10/2 = 2/110 = 1.82% (promediar daría 10%)
  // Ambas en P005 para que al filtrar por ese producto las tarjetas muestren exactamente este caso
  { sku: "P005", batch_number: "L-2026-105", days_ago: 2, units_inspected: 100, units_defective: 0, inspector_name: "Luis Martínez" }, // 0% -> Approved
  { sku: "P005", batch_number: "L-2026-106", days_ago: 2, units_inspected: 10, units_defective: 2, inspector_name: "Carlos Pérez" }, // 20% -> Rejected
  // Redondeo engañoso: 250/4999 = 5.001% se guarda y muestra como 5%, pero se clasifica con el valor exacto
  { sku: "P002", batch_number: "L-2026-107", days_ago: 3, units_inspected: 4999, units_defective: 250, inspector_name: "María López" }, // 5.001% -> Observations
];

function localDate(days_ago: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days_ago);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

async function insertMissingSampleInspections(organization_id: string): Promise<number> {
  const [{ data: products, error: products_error }, { data: existing, error: existing_error }] =
    await Promise.all([
      supabase.from("products").select("id, sku").eq("organization_id", organization_id),
      supabase
        .from("inspections")
        .select("batch_number")
        .eq("organization_id", organization_id)
        .in("batch_number", DEMO_INSPECTIONS.map((inspection) => inspection.batch_number)),
    ]);
  if (products_error) throw new Error(`Could not load the catalog: ${products_error.message}`);
  if (existing_error) throw new Error(`Could not load inspections: ${existing_error.message}`);

  const product_ids = new Map(products.map((product) => [product.sku, product.id]));
  const existing_batches = new Set(existing.map((inspection) => inspection.batch_number));

  const rows = DEMO_INSPECTIONS.filter(
    (inspection) => !existing_batches.has(inspection.batch_number),
  ).map((inspection) => ({
    organization_id,
    product_id: product_ids.get(inspection.sku),
    batch_number: inspection.batch_number,
    inspection_date: localDate(inspection.days_ago),
    ...classifyInspection(inspection.units_inspected, inspection.units_defective),
    inspector_name: inspection.inspector_name,
    notes: null,
  }));
  if (rows.length === 0) return 0;

  const { error } = await supabase.from("inspections").insert(rows);
  if (error) throw new Error(`Could not insert the sample inspections: ${error.message}`);
  return rows.length;
}

export async function loadDemoData(organization_id: string): Promise<number> {
  const { error } = await supabase.rpc("load_demo_catalog", {
    target_organization_id: organization_id,
  });
  if (error) throw new Error(`Could not load the demo catalog: ${error.message}`);
  return insertMissingSampleInspections(organization_id);
}

// Borra todos los productos e inspecciones de la organización y la deja vacía
export async function resetOrganizationData(organization_id: string): Promise<void> {
  const { error } = await supabase.rpc("reset_organization_data", {
    target_organization_id: organization_id,
  });
  if (error) throw new Error(`Could not reset the organization data: ${error.message}`);
}
