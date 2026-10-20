"use server";

import { revalidatePath } from "next/cache";
import * as data from "@/lib/inspections";
import { runAction, type ActionState } from "@/lib/action-state";
import { formValues, parseInspection } from "@/lib/validation";

export async function createInspection(_state: ActionState, form_data: FormData): Promise<ActionState> {
  return runAction(
    async () => {
      await data.insertInspection(parseInspection(formValues(form_data)));
      revalidatePath("/", "layout");
    },
    {
      success: "Inspection created successfully.",
      failure: "Could not create the inspection",
      redirect_to: "/inspections",
    },
  );
}

export async function updateInspection(
  id: string,
  _state: ActionState,
  form_data: FormData,
): Promise<ActionState> {
  return runAction(
    async () => {
      await data.updateInspection(id, parseInspection(formValues(form_data)));
      revalidatePath("/", "layout");
    },
    {
      success: "Inspection updated successfully.",
      failure: "Could not update the inspection",
      redirect_to: "/inspections",
    },
  );
}

export async function deleteInspection(id: string): Promise<ActionState> {
  return runAction(
    async () => {
      await data.deleteInspection(id);
      revalidatePath("/", "layout");
    },
    {
      success: "Inspection deleted successfully.",
      failure: "Could not delete the inspection",
      redirect_to: "/inspections",
    },
  );
}
