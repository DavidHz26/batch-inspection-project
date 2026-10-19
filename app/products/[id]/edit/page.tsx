import { Suspense } from "react";
import { Loading } from "@/app/loading-text";
import { notFound } from "next/navigation";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getProduct } from "@/lib/products";
import { ConfirmSubmitButton } from "@/app/confirm-submit-button";
import { ActionForm } from "@/app/action-form";
import { deleteProduct, updateProduct } from "../../actions";
import { ProductForm } from "../../product-form";

export default function EditProductPage({ params }: PageProps<"/products/[id]/edit">) {
  return (
    <Suspense fallback={<Loading label="product" />}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: Pick<PageProps<"/products/[id]/edit">, "params">) {
  const { id } = await params;
  const organization_id = await getCurrentOrganizationId();
  const product = organization_id ? await getProduct(organization_id, id) : null;
  if (!product) notFound();

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Edit {product.name}</h1>
        <p className="text-sm text-gray-500">
          SKU {product.sku} · {product.is_active ? "active" : "inactive"} ·
          created {new Date(product.created_at).toLocaleString()}
        </p>
      </div>

      <div className="border rounded-lg p-4 sm:p-6 space-y-4 bg-background">
        <ProductForm
          key={`${product.id}-${product.sku}-${product.name}-${product.is_active}`}
          action={updateProduct.bind(null, product.id)}
          product={product}
          submit_label="Save"
          confirm_message={`Save changes to "${product.name}"?`}
          confirm_submessage="Your product details will be updated."
        />
      </div>

      <div className="border border-red-900/30 rounded-lg p-4 sm:p-6 space-y-4 bg-red-950/10">
        <div>
          <h2 className="font-semibold text-red-700 text-base">Delete Product</h2>
          <p className="text-sm text-muted-foreground">
            This action is irreversible. Please be certain. Products with inspections cannot be deleted; mark them as inactive instead.
          </p>
        </div>
        <ActionForm action={deleteProduct.bind(null, product.id)}>
          <ConfirmSubmitButton
            message={`Delete "${product.name}" (${product.sku})?`}
            submessage="This action is permanent and cannot be reversed."
            class_name="px-3.5 py-1.5 rounded text-sm bg-red-700 text-white hover:bg-red-800 transition-colors"
            confirm_class_name="bg-red-700 text-white hover:bg-red-800"
          >
            Delete
          </ConfirmSubmitButton>
        </ActionForm>
      </div>
    </div>
  );
}
