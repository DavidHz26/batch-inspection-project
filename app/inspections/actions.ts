"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as data from "@/lib/inspections";
import { formValues, parseInspection } from "@/lib/validation";

export async function createInspection(formData: FormData) {
  await data.insertInspection(parseInspection(formValues(formData)));
  revalidatePath("/", "layout");
  redirect("/inspections");
}

export async function updateInspection(id: string, formData: FormData) {
  await data.updateInspection(id, parseInspection(formValues(formData)));
  revalidatePath("/", "layout");
  redirect("/inspections");
}

export async function deleteInspection(id: string) {
  await data.deleteInspection(id);
  revalidatePath("/", "layout");
  redirect("/inspections");
}
