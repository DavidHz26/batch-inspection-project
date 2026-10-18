import { requireOrganizationId } from "./organization";
import { supabase } from "./supabase";
import type { Product, ProductInput } from "./types";


export async function getProducts(organizationId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name");

  if (error) throw new Error(`Error al cargar productos: ${error.message}`);
  return data || [];
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Error al cargar el producto: ${error.message}`);
  return data;
}

export async function insertProduct(input: ProductInput): Promise<Product> {
  const organizationId = await requireOrganizationId();
  const { data, error } = await supabase
    .from("products")
    .insert({ ...input, organization_id: organizationId })
    .select()
    .single();

  if (error) throw new Error(`Error al crear producto: ${error.message}`);
  return data;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<Product> {
  const organizationId = await requireOrganizationId();
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("organization_id", organizationId)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Error al actualizar producto: ${error.message}`);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const organizationId = await requireOrganizationId();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("organization_id", organizationId)
    .eq("id", id);

  if (error) {
    if (error.code === "23503") {
      throw new Error("No se puede eliminar un producto con inspecciones asociadas.");
    }
    throw new Error(`Error al eliminar producto: ${error.message}`);
  }
}
