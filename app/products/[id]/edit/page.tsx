import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getProduct } from "@/lib/products";
import { ConfirmSubmitButton } from "@/app/confirm-submit-button";
import { deleteProduct, updateProduct } from "../../actions";
import { ProductForm } from "../../product-form";

export default function EditProductPage({
  params,
}: PageProps<"/products/[id]/edit">) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({
  params,
}: Pick<PageProps<"/products/[id]/edit">, "params">) {
  const { id } = await params;
  const organizationId = await getCurrentOrganizationId();
  const product = organizationId ? await getProduct(organizationId, id) : null;
  if (!product) notFound();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Edit {product.name}</h1>
          <p className="text-sm text-gray-500">
            SKU {product.sku} · {product.is_active ? "active" : "inactive"} ·
            created {new Date(product.created_at).toLocaleString()}
          </p>
        </div>
        <ProductForm
          key={`${product.id}-${product.sku}-${product.name}-${product.is_active}`}
          action={updateProduct.bind(null, product.id)}
          product={product}
          submitLabel="Save"
        />
      </div>

      <section className="space-y-2 border-t pt-4">
        <h2 className="font-semibold text-red-700">Delete product</h2>
        <p className="text-sm text-gray-500">
          This action cannot be undone. Products with inspections cannot be
          deleted; mark them as inactive instead.
        </p>
        <form action={deleteProduct.bind(null, product.id)}>
          <ConfirmSubmitButton
            message={`Delete "${product.name}" (${product.sku})? This action cannot be undone.`}
            className="bg-red-700"
          >
            Delete
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}
