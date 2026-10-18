import { Suspense } from "react";
import { createInspection } from "../actions";
import { InspectionForm } from "../inspection-form";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getProducts } from "@/lib/products";

export default function NewInspectionPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Inspection</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <NewInspection />
      </Suspense>
    </div>
  );
}

async function NewInspection() {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return <p> Select an organization to register inspections. </p>;
  }

  const products = (await getProducts(organizationId)).filter(
    (product) => product.is_active,
  );

  if (products.length === 0) {
    return <p> No active products available. Please create a product first. </p>;
  }

  return <InspectionForm action={createInspection} products={products} submitLabel="Create" />;
}
