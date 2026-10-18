import { requireOrganizationId } from "./organization";
import { supabase } from "./supabase";
import { pageRange, type Paginated } from "./pagination";
import type { Product, ProductInput } from "./types";

export async function getProductsPage(
  organization_id: string,
  page: number,
  pageSize: number,
): Promise<Paginated<Product>> {
  const { from, to } = pageRange(page, pageSize);
  const { data, error, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("organization_id", organization_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(`Error while fetching products: ${error.message}`);
  return { data: data || [], count: count || 0 };
}

export async function getProducts(organization_id: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", organization_id);

  if (error) throw new Error(`Error while fetching products: ${error.message}`);
  return data || [];
}

export async function getProduct(organization_id: string, id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organization_id)
    .maybeSingle();

  if (error) throw new Error(`Error while fetching single product: ${error.message}`);
  return data;
}

export async function insertProduct(input: ProductInput): Promise<Product> {
  const organizationId = await requireOrganizationId();
  const { data, error } = await supabase
    .from("products")
    .insert({ ...input, organization_id: organizationId })
    .select()
    .single();

  if (error) throw new Error(`Error while trying to create a product: ${error.message}`);
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

  if (error) throw new Error(`Error while trying to update a product: ${error.message}`);
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
      throw new Error("Cant delete a product associated with an inspection.");
    }
    throw new Error(`Error while trying to delete a product: ${error.message}`);
  }
}
