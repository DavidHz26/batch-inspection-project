"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as data from "@/lib/products";
import { formValues, parseProduct } from "@/lib/validation";

function productFromForm(formData: FormData) {
  return parseProduct(formValues(formData), { isActiveDefault: false });
}

export async function createProduct(formData: FormData) {
  await data.insertProduct(productFromForm(formData));
  revalidatePath("/", "layout");
  redirect("/products");
}

export async function updateProduct(id: string, formData: FormData) {
  if (!id) throw new Error("Invalid product ID");

  await data.updateProduct(id, productFromForm(formData));
  revalidatePath("/", "layout");
  redirect("/products");
}

export async function deleteProduct(id: string) {
  if (!id) throw new Error("Invalid product ID");

  await data.deleteProduct(id);
  revalidatePath("/", "layout");
  redirect("/products");
}
