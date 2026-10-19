-- Funciones de datos de demostración y gestión por organización
-- Son llamadas por la app (como en las acciones de edición y la zona de peligro),
-- manteniendo centralizada la lógica en la base de datos
--
-- Nota: Las inspecciones de ejemplo se gestionan desde el cliente o mediante 
-- la lógica de la app, asegurando que los porcentajes y estados usen siempre 
-- la regla de clasificación vigente

-- Agrega a la organización los 5 productos del catálogo inicial que le falten.
-- Equivalente al botón "Load" de la sección Demo Data: no borra ni modifica nada
create or replace function load_demo_catalog(target_organization_id uuid)
returns void
language sql
set search_path = public
as $$
  insert into products (organization_id, sku, name)
  select target_organization_id, catalog.sku, catalog.name
  from (
    values
      ('P001', 'Martillo'),
      ('P002', 'Pinzas'),
      ('P003', 'Desarmador'),
      ('P004', 'Flexómetro'),
      ('P005', 'Llave ajustable')
  ) as catalog (sku, name)
  where not exists (
    select 1 from products
    where products.organization_id = target_organization_id
      and products.sku = catalog.sku
  );
$$;

-- Equivalente al botón "Reset" de la Danger Zone
-- Borra todas las inspecciones y productos de esta organización y restaura el catálogo inicial
create or replace function reset_organization_data(target_organization_id uuid)
returns void
language plpgsql
set search_path = public
as $$
begin
  -- Se limpian primero las inspecciones debido a la restricción `on delete restrict`
  delete from inspections where organization_id = target_organization_id;
  delete from products where organization_id = target_organization_id;
  perform load_demo_catalog(target_organization_id);
end;
$$;

grant execute on function load_demo_catalog(uuid) to anon;
grant execute on function reset_organization_data(uuid) to anon;
