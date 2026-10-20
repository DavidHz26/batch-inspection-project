import type { Inspection, Organization, Product } from "@/lib/types";

export const org: Organization = {
  id: "org-1",
  name: "Acme",
  slug: "acme",
  created_at: "2026-01-15T00:00:00.000Z",
};

export const product: Product = {
  id: "prod-1",
  organization_id: "org-1",
  sku: "P001",
  name: "Widget",
  is_active: true,
  created_at: "2026-02-01T00:00:00.000Z",
};

export const inspection: Inspection = {
  id: "insp-1",
  organization_id: "org-1",
  product_id: "prod-1",
  batch_number: "B-001",
  inspection_date: "2026-03-01",
  units_inspected: 100,
  units_defective: 2,
  defect_percentage: 2,
  status: "Approved",
  inspector_name: "David",
  notes: null,
  created_at: "2026-03-01T00:00:00.000Z",
  products: { sku: "P001", name: "Widget" },
};

export function formData(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }
  return data;
}
