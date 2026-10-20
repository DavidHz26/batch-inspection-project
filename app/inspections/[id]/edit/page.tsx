import { Suspense } from "react";
import { Loading } from "@/app/loading-text";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/app/status-badge";
import { exactDefectPercentage, isRoundingMisleading } from "@/lib/quality-calculator";
import { ConfirmSubmitButton } from "@/app/confirm-submit-button";
import { ActionForm } from "@/app/action-form";
import { deleteInspection, updateInspection } from "../../actions";
import { InspectionForm } from "../../inspection-form";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getInspection } from "@/lib/inspections";
import { getProducts } from "@/lib/products";

export default function EditInspectionPage({ params }: PageProps<"/inspections/[id]/edit">) {
  return (
    <Suspense fallback={<Loading label="inspection" />}>
      <EditInspection params={params} />
    </Suspense>
  );
}

async function EditInspection({ params }: Pick<PageProps<"/inspections/[id]/edit">, "params">) {
  const { id } = await params;
  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) notFound();

  const [inspection, products] = await Promise.all([
    getInspection(id),
    getProducts(organization_id),
  ]);
  if (!inspection) notFound();

  const rounding_misleading = isRoundingMisleading(
    inspection.units_inspected,
    inspection.units_defective,
  );
  const exact_percentage = exactDefectPercentage(
    inspection.units_inspected,
    inspection.units_defective,
  );

  const options = products.filter(
    (product) => product.is_active || product.id === inspection.product_id,
  );

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold flex flex-wrap gap-x-3 gap-y-1 items-center">
          Batch {inspection.batch_number}{" "}
          <StatusBadge status={inspection.status} />
        </h1>
        <p className="text-sm text-muted-foreground">
          {rounding_misleading ? (
            <>
              <span className="font-medium text-warning">{exact_percentage}% defects</span>{" "}
              (exact value used for the status; shown as {inspection.defect_percentage}%)
            </>
          ) : (
            <>{inspection.defect_percentage}% defects</>
          )}{" "}
          · created{" "}
          {new Date(inspection.created_at).toLocaleString()}
        </p>
      </div>

      <div className="border rounded-xl p-4 sm:p-6 space-y-4 bg-surface">
        <InspectionForm
          key={`${inspection.id}-${inspection.units_inspected}-${inspection.units_defective}-${inspection.notes}`}
          action={updateInspection.bind(null, inspection.id)}
          products={options}
          inspection={inspection}
          submit_label="Save"
          confirm_message={`Save changes to batch "${inspection.batch_number}"?`}
          confirm_submessage="The defect percentage and status will be recalculated."
        />
      </div>

      <div className="border border-danger/40 rounded-xl p-4 sm:p-6 space-y-4 bg-danger/5">
        <h2 className="font-semibold text-danger text-base">Danger</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm">Delete Inspection</h3>
            <p className="text-sm text-muted-foreground">
              This action is irreversible. Please be certain.
            </p>
          </div>

          <ActionForm action={deleteInspection.bind(null, inspection.id)} className="flex justify-end w-full">
            <ConfirmSubmitButton
              message={`Delete the inspection of batch "${inspection.batch_number}"?`}
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
