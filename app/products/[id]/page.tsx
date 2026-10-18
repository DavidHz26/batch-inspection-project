import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentOrganizationId, getProduct } from "@/lib/data";
import { deleteProduct, updateProduct } from "../actions";
import { ProductForm } from "../product-form";

export default function EditProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<p>Loading product...</p>}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({
  params,
}: Pick<PageProps<"/products/[id]">, "params">) {
  const { id } = await params;
  const organizationId = await getCurrentOrganizationId();
  const product = organizationId ? await getProduct(organizationId, id) : null;
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Product {product.sku}</h1>

      <ProductForm
        action={updateProduct.bind(null, product.id)}
        product={product}
        submitLabel="Save changes"
      />

      <form action={deleteProduct.bind(null, product.id)}>
        <button type="submit" className="bg-red-700">
          Delete product
        </button>
      </form>
    </div>
  );
}
