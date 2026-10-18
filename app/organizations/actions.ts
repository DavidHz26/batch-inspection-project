"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as data from "@/lib/organization";
import { formValues, parseOrganization } from "@/lib/validation";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function setOrganizationCookie(id: string) {
  (await cookies()).set(data.ORGANIZATION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function selectOrganization(formData: FormData) {
  const id = text(formData, "organization_id");
  const organizations = await data.getOrganizations();
  if (!organizations.some((org) => org.id === id)) {
    throw new Error("Organización no válida");
  }

  await setOrganizationCookie(id);
  revalidatePath("/", "layout");
}

export async function createOrganization(formData: FormData) {
  const organization = await data.insertOrganization(
    parseOrganization(formValues(formData)),
  );

  await setOrganizationCookie(organization.id);
  revalidatePath("/", "layout");
  redirect("/organizations");
}

export async function updateOrganization(id: string, formData: FormData) {
  await data.updateOrganization(id, parseOrganization(formValues(formData)));
  revalidatePath("/", "layout");
  redirect("/organizations");
}

export async function deleteOrganization(id: string) {
  if (!id) throw new Error("ID de organización inválido");

  await data.deleteOrganization(id);
  revalidatePath("/", "layout");
  redirect("/organizations");
}
