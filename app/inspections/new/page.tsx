import { Suspense } from "react";
import Link from "next/link";
import { getCurrentOrganizationId, getProducts } from "@/lib/data";
import { createInspection } from "../actions";
import { InspectionForm } from "../inspection-form";

export default function NewInspectionPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Inspection</h1>
      <Suspense fallback={<p>Loading products...</p>}>
        <NewInspection />
      </Suspense>
    </div>
  );
}

async function NewInspection() {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return <p>Select an organization to register inspections.</p>;
  }

  const products = (await getProducts(organizationId)).filter(
    (product) => product.is_active,
  );
  if (products.length === 0) {
    return (
      <p>
        No active products.{" "}
        <Link href="/products" className="underline">
          Create one first
        </Link>
        .
      </p>
    );
  }

  return (
    <InspectionForm
      action={createInspection}
      products={products}
      submitLabel="Create"
    />
  );
}
