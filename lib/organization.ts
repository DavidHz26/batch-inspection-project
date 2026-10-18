import { cookies } from "next/headers";
import { supabase } from "./supabase";
import type { Organization, OrganizationInput } from "./types";

export const ORGANIZATION_COOKIE = "organization_id";

export async function getOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("name");

  if (error) throw new Error(`Error al cargar organizaciones: ${error.message}`);
  return data || [];
}

export async function getOrganization(id: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Error al cargar la organización: ${error.message}`);
  return data;
}

export async function getCurrentOrganizationId(): Promise<string | null> {
  const cookieStore = await cookies();
  const selected = cookieStore.get(ORGANIZATION_COOKIE)?.value;
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
  const updateData: Partial<OrganizationInput> = { ...input };
  if (updateData.name && !updateData.slug) {
    updateData.slug = updateData.name.toLowerCase().replace(/\s+/g, "-");
  }

  const { data, error } = await supabase
    .from("organizations")
    .update(updateData)
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
