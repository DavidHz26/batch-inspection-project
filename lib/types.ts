export type InspectionStatus = 'Aprobado' | 'Observaciones' | 'Rechazado';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  organization_id: string;
  sku: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Inspection {
  id: string;
  organization_id: string;
  product_id: string;
  batch_number: string;
  inspection_date: string;
  units_inspected: number;
  units_defective: number;
  defect_percentage: number;
  status: InspectionStatus;
  inspector_name: string | null;
  notes: string | null;
  created_at: string;
  products?: Pick<Product, 'sku' | 'name'> | null;
}

export type OrganizationInput = Pick<Organization, 'name' | 'slug'>;

export type ProductInput = Pick<Product, 'sku' | 'name' | 'is_active'>;

export type InspectionInput = Omit<
  Inspection,
  'id' | 'organization_id' | 'created_at' | 'products'
>;

export interface InspectionFilters {
  productId?: string;
  status?: string;
}

export interface GlobalMetrics {
  totalInspections: number;
  totalInspectedUnits: number;
  totalDefectiveUnits: number;
  globalDefectPercentage: number | null;
}
