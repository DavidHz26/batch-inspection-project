-- "Reset" ahora deja la organización vacía en lugar de restaurar los datos de ejemplo
-- Borra todas las inspecciones y productos de la organización; para volver a tener el
-- catálogo inicial y las inspecciones de ejemplo se usa "Load" (load_demo_catalog)
create or replace function reset_organization_data(target_organization_id uuid)
returns void
language plpgsql
set search_path = public
as $$
begin
  -- Se limpian primero las inspecciones debido a la restricción `on delete restrict`
  delete from inspections where organization_id = target_organization_id;
  delete from products where organization_id = target_organization_id;
end;
$$;
