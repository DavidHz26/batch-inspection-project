import { Suspense } from "react";
import { Alert } from "@/app/alert";
import { Loading } from "@/app/loading-text";
import { getCurrentOrganizationId } from "@/lib/organization";
import { createProduct } from "../actions";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold">New Product</h1>
        <p className="text-sm text-muted-foreground">
          It will be added to the active organization.
        </p>
      </div>

      <Suspense fallback={<Loading />}>
        <NewProduct />
      </Suspense>
    </div>
  );
}

async function NewProduct() {
  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) {
    return <Alert variant="warning">Select an organization to create products.</Alert>;
  }

  return (
    <div className="border rounded-xl p-4 sm:p-6 space-y-4 bg-surface">
      <ProductForm
        action={createProduct}
        submit_label="Create"
        confirm_message="Create product?"
        confirm_submessage="The product will be added to the active organization."
      />
    </div>
  );
}
