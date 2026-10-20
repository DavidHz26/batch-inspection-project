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
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Edit {product.name}</h1>
        <p className="text-sm text-muted-foreground">
          SKU {product.sku} · {product.is_active ? "active" : "inactive"} ·
          created {new Date(product.created_at).toLocaleString()}
        </p>
      </div>

      <div className="border rounded-xl p-4 sm:p-6 space-y-4 bg-surface">
        <ProductForm
          key={`${product.id}-${product.sku}-${product.name}-${product.is_active}`}
          action={updateProduct.bind(null, product.id)}
          product={product}
          submit_label="Save"
          confirm_message={`Save changes to "${product.name}"?`}
          confirm_submessage="Your product details will be updated."
        />
      </div>

      <div className="border border-danger/40 rounded-xl p-4 sm:p-6 space-y-4 bg-danger/5">
        <h2 className="font-semibold text-danger text-base">Danger</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm">Delete Product</h3>
            <p className="text-sm text-muted-foreground">
              This action is irreversible. Please be certain. Products with inspections cannot be deleted; mark them as inactive instead.
            </p>
          </div>

          <ActionForm action={deleteProduct.bind(null, product.id)} className="flex justify-end w-full">
            <ConfirmSubmitButton
              message={`Delete "${product.name}" (${product.sku})?`}
              submessage="This action is permanent and cannot be reversed."
              class_name="px-5 py-2 rounded-full text-sm font-semibold bg-danger text-white hover:bg-danger/85 transition-colors shadow-sm"
              confirm_class_name="bg-danger text-white hover:bg-danger/85"
            >
              Delete
            </ConfirmSubmitButton>
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
