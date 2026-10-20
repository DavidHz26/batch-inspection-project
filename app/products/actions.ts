"use server";

import { revalidatePath } from "next/cache";
import * as data from "@/lib/products";
import { runAction, type ActionState } from "@/lib/action-state";
import { formValues, parseProduct } from "@/lib/validation";

function productFromForm(form_data: FormData) {
  return parseProduct(formValues(form_data), { is_active_default: false });
}

export async function createProduct(_state: ActionState, form_data: FormData): Promise<ActionState> {
  return runAction(
    async () => {
      await data.insertProduct(productFromForm(form_data));
      revalidatePath("/", "layout");
    },
    {
      success: "Product created successfully.",
      failure: "Could not create the product",
      redirect_to: "/products",
    },
  );
}

export async function updateProduct(
  id: string,
  _state: ActionState,
  form_data: FormData,
): Promise<ActionState> {
  return runAction(
    async () => {
      if (!id) throw new Error("Invalid product ID");
      await data.updateProduct(id, productFromForm(form_data));
      revalidatePath("/", "layout");
    },
    {
      success: "Product updated successfully.",
      failure: "Could not update the product",
      redirect_to: "/products",
    },
  );
}

export async function deleteProduct(id: string): Promise<ActionState> {
  return runAction(
    async () => {
      if (!id) throw new Error("Invalid product ID");
      await data.deleteProduct(id);
      revalidatePath("/", "layout");
    },
    {
      success: "Product deleted successfully.",
      failure: "Could not delete the product",
      redirect_to: "/products",
    },
  );
}
