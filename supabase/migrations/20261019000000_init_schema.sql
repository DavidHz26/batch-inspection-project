-- Organizaciones
-- Almacena las empresas o espacios de trabajo principales de la aplicación.
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Productos (catálogo por organización)
-- Catálogo de productos asociados a cada organización para las inspecciones de calidad.
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  sku text not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, sku)
);

-- Inspecciones
-- Registros de control de calidad por lote, incluyendo unidades inspeccionadas, defectuosas, porcentaje calculado y estado (Approved, Observations, Rejected).
create table if not exists inspections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  product_id uuid not null references products (id) on delete restrict,
  batch_number text not null check (length(trim(batch_number)) > 0),
  inspection_date date not null,
  units_inspected integer not null check (units_inspected > 0),
  units_defective integer not null check (
    units_defective >= 0 and units_defective <= units_inspected
  ),
  -- Calculados en el servidor (lib/quality-calculator.ts); nunca se capturan.
  defect_percentage numeric(5, 2) not null,
  status text not null check (status in ('Approved', 'Observations', 'Rejected')),
  inspector_name text,
  notes text,
  created_at timestamptz not null default now()
);
