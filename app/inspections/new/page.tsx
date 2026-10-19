import { Suspense } from "react";
import { Alert } from "@/app/alert";
import { Loading } from "@/app/loading-text";
import { createInspection } from "../actions";
import { InspectionForm } from "../inspection-form";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getProducts } from "@/lib/products";

export default function NewInspectionPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold">New Inspection</h1>
        <p className="text-sm text-gray-500">
          The defect percentage and status are calculated automatically.
        </p>
      </div>

      <Suspense fallback={<Loading label="products" />}>
        <NewInspection />
      </Suspense>
    </div>
  );
}

async function NewInspection() {
  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) {
    return <Alert variant="warning">Select an organization to register inspections.</Alert>;
  }

  const products = (await getProducts(organization_id)).filter(
    (product) => product.is_active,
  );

  if (products.length === 0) {
    return <Alert variant="warning">No active products available. Please create a product first.</Alert>;
  }

  return (
    <div className="border rounded-lg p-4 sm:p-6 space-y-4 bg-background">
      <InspectionForm
        action={createInspection}
        products={products}
        submit_label="Create"
        confirm_message="Create inspection?"
        confirm_submessage="The defect percentage and status will be calculated automatically."
      />
    </div>
  );
}
