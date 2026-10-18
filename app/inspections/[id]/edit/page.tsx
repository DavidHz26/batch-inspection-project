import { Suspense } from "react";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/app/status-badge";
import { ConfirmSubmitButton } from "@/app/confirm-submit-button";
import { deleteInspection, updateInspection } from "../../actions";
import { InspectionForm } from "../../inspection-form";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getInspection } from "@/lib/inspections";
import { getProducts } from "@/lib/products";

export default function EditInspectionPage({
  params,
}: PageProps<"/inspections/[id]/edit">) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <EditInspection params={params} />
    </Suspense>
  );
}

async function EditInspection({
  params,
}: Pick<PageProps<"/inspections/[id]/edit">, "params">) {
  const { id } = await params;
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) notFound();

  const [inspection, products] = await Promise.all([
    getInspection(id),
    getProducts(organizationId),
  ]);
  if (!inspection) notFound();

  const options = products.filter(
    (product) => product.is_active || product.id === inspection.product_id,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold flex gap-3 items-center">
          Batch {inspection.batch_number}{" "}
          <StatusBadge status={inspection.status} />
        </h1>
        <p className="text-sm text-gray-500">
          {inspection.defect_percentage}% defects · created{" "}
          {new Date(inspection.created_at).toLocaleString()}
        </p>
      </div>

      <InspectionForm
        action={updateInspection.bind(null, inspection.id)}
        products={options}
        inspection={inspection}
        submitLabel="Save"
      />

      <section className="space-y-2 border-t pt-4">
        <h2 className="font-semibold text-red-700">Delete inspection</h2>
        <p className="text-sm text-gray-500">This action cannot be undone.</p>
        <form action={deleteInspection.bind(null, inspection.id)}>
          <ConfirmSubmitButton
            message={`Delete the inspection of batch "${inspection.batch_number}"? This action cannot be undone.`}
            className="bg-red-700"
          >
            Delete
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}
