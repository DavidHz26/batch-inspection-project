"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import * as data from "@/lib/organization";
import * as demo from "@/lib/demo-data";
import { runAction, type ActionState } from "@/lib/action-state";
import { formValues, parseOrganization } from "@/lib/validation";

function text(form_data: FormData, key: string) {
  return String(form_data.get(key) ?? "").trim();
}

async function setOrganizationCookie(id: string) {
  (await cookies()).set(data.ORGANIZATION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function selectOrganization(form_data: FormData) {
  const id = text(form_data, "organization_id");
  const organizations = await data.getOrganizations();
  if (!organizations.some((org) => org.id === id)) {
    throw new Error("Organización no válida");
  }

  await setOrganizationCookie(id);
  revalidatePath("/", "layout");
}

export async function createOrganization(_state: ActionState, form_data: FormData): Promise<ActionState> {
  return runAction(
    async () => {
      const organization = await data.insertOrganization(
        parseOrganization(formValues(form_data)),
      );
      await setOrganizationCookie(organization.id);
      revalidatePath("/", "layout");
    },
    {
      success: "Organization created successfully.",
      failure: "Could not create the organization",
      redirect_to: "/organizations",
    },
  );
}

export async function updateOrganization(
  id: string,
  _state: ActionState,
  form_data: FormData,
): Promise<ActionState> {
  return runAction(
    async () => {
      await data.updateOrganization(id, parseOrganization(formValues(form_data)));
      revalidatePath("/", "layout");
    },
    {
      success: "Organization updated successfully.",
      failure: "Could not update the organization",
      redirect_to: "/organizations",
    },
  );
}

export async function deleteOrganization(id: string): Promise<ActionState> {
  return runAction(
    async () => {
      if (!id) throw new Error("Invalid organization ID");
      await data.deleteOrganization(id);
      revalidatePath("/", "layout");
    },
    {
      success: "Organization deleted successfully.",
      failure: "Could not delete the organization",
      redirect_to: "/organizations",
    },
  );
}

// Datos de demostración (solo con DEMO_DATA_ENABLED=true).
async function requireDemoOrganization(id: string) {
  if (!demo.isDemoDataEnabled()) {
    throw new Error("Demo data is disabled on this server (DEMO_DATA_ENABLED).");
  }
  if (!id || !(await data.getOrganization(id))) {
    throw new Error("Invalid organization ID");
  }
}

export async function loadDemoData(id: string): Promise<ActionState> {
  return runAction(
    async () => {
      await requireDemoOrganization(id);
      await demo.loadDemoData(id);
      await setOrganizationCookie(id);
      revalidatePath("/", "layout");
    },
    {
      success: "Demo data loaded successfully.",
      failure: "Could not load the demo data",
      redirect_to: "/inspections",
    },
  );
}

export async function resetDemoData(id: string): Promise<ActionState> {
  return runAction(
    async () => {
      await requireDemoOrganization(id);
      await demo.resetOrganizationData(id);
      await setOrganizationCookie(id);
      revalidatePath("/", "layout");
    },
    {
      success: "Organization reset to demo data successfully.",
      failure: "Could not reset the organization data",
      redirect_to: "/inspections",
    },
  );
}
