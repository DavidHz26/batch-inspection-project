import { Suspense } from "react";
import { createProduct } from "./actions";
import { ProductForm } from "./product-form";
import { ProductTable } from "./product-table";
import { getCurrentOrganizationId } from "@/lib/organization";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Products</h1>

      <Suspense fallback={<p>Loading products...</p>}>
        <ProductTable />
      </Suspense>

      <section className="space-y-2">
        <h2 className="font-semibold">New Product</h2>
        <Suspense fallback={null}>
          <NewProduct />
        </Suspense>
      </section>
    </div>
  );
}

async function NewProduct() {
  if (!(await getCurrentOrganizationId())) {
    return <p>Select an organization to create products.</p>;
  }
  return <ProductForm action={createProduct} submitLabel="Create" />;
}
