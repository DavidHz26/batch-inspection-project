-- Datos iniciales: organización "Planta Demo" con el catálogo de 5 productos
-- (P001 Martillo, P002 Pinzas, P003 Desarmador, P004 Flexómetro, P005 Llave ajustable).
--
-- Cómo ejecutarlo:
--   - Supabase CLI: `supabase db reset` aplica las migraciones y luego este archivo.
--   - Manual: pegar en el SQL Editor de Supabase, después de las migraciones.
--
-- Es idempotente (seguro de repetir): crea la organización si no existe y 
-- le agrega los productos faltantes usando la función `load_demo_catalog()`.

insert into organizations (id, name, slug)
select '00000000-0000-4000-8000-000000000001', 'Planta Demo', 'planta-demo'
where not exists (
  select 1 from organizations
  where id = '00000000-0000-4000-8000-000000000001' or slug = 'planta-demo'
);

select load_demo_catalog(id) from organizations where slug = 'planta-demo';