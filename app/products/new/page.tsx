import { Suspense } from "react";
import { getCurrentOrganizationId } from "@/lib/organization";
import { createProduct } from "../actions";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Product</h1>
      <Suspense fallback={null}>
        <NewProduct />
      </Suspense>
    </div>
  );
}

async function NewProduct() {
  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) {
    return <p> Select an organization to create products. </p>;
  }
  return <ProductForm action={createProduct} submitLabel="Create" />;
}
