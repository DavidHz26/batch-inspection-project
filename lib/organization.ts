import { cookies } from "next/headers";
import { supabase } from "./supabase";
import { pageRange, type Paginated } from "./pagination";
import type { Organization, OrganizationInput } from "./types";

export const ORGANIZATION_COOKIE = "organization_id";

export async function getOrganizationsPage(
  page: number,
  page_size: number,
): Promise<Paginated<Organization>> {
  const { from, to } = pageRange(page, page_size);
  const { data, error, count } = await supabase
    .from("organizations")
    .select("*", { count: "exact" })
    .order("name")
    .range(from, to);

  if (error) throw new Error(`Error while trying to get the organizations: ${error.message}`);
  return { data: data || [], count: count || 0 };
}

export async function getOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("name");

  if (error) throw new Error(`Error while trying to get the organizations: ${error.message}`);
  return data || [];
}

export async function getOrganization(id: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Error while trying to get the organization: ${error.message}`);
  return data;
}

export async function getCurrentOrganizationId(): Promise<string | null> {
  const cookie_store = await cookies();
  const selected = cookie_store.get(ORGANIZATION_COOKIE)?.value;
  const organizations = await getOrganizations();
  
  if (organizations.length === 0) return null;

  if (selected && organizations.some((o) => o.id === selected)) {
    return selected;
  }

  return organizations[0].id;
}

export async function insertOrganization(input: OrganizationInput): Promise<Organization> {
  const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, "-");
  
  const { data, error } = await supabase
    .from("organizations")
    .insert({ name: input.name, slug })
    .select()
    .single();

  if (error) throw new Error(`Could not create organization: ${error.message}`);
  return data;
}

export async function updateOrganization(
  id: string,
  input: Partial<OrganizationInput>
): Promise<Organization> {
  const update_data: Partial<OrganizationInput> = { ...input };
  if (update_data.name && !update_data.slug) {
    update_data.slug = update_data.name.toLowerCase().replace(/\s+/g, "-");
  }

  const { data, error } = await supabase
    .from("organizations")
    .update(update_data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Could not update organization: ${error.message}`);
  return data;
}

export async function deleteOrganization(id: string): Promise<void> {
  const { error } = await supabase
    .from("organizations")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Could not delete organization: ${error.message}`);
}

export async function requireOrganizationId(): Promise<string> {
  const id = await getCurrentOrganizationId();
  if (!id) throw new Error("Select an organization to proceed");
  return id;
}
