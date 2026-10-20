import { Suspense } from "react";
import { Loading } from "@/app/loading-text";
import { notFound } from "next/navigation";
import { getOrganization } from "@/lib/organization";
import { ConfirmSubmitButton } from "@/app/confirm-submit-button";
import { ActionForm } from "@/app/action-form";
import { isDemoDataEnabled } from "@/lib/demo-data";
import {
  deleteOrganization,
  loadDemoData,
  resetDemoData,
  updateOrganization,
} from "../../actions";
import { OrganizationForm } from "../../organization-form";

export default function EditOrganizationPage({ params }: PageProps<"/organizations/[id]/edit">) {
  return (
    <Suspense fallback={<Loading label="organization" />}>
      <EditOrganization params={params} />
    </Suspense>
  );
}

async function EditOrganization({ params }: Pick<PageProps<"/organizations/[id]/edit">, "params">) {
  const { id } = await params;
  const organization = await getOrganization(id);
  if (!organization) notFound();
  const demo_enabled = isDemoDataEnabled();

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Edit {organization.name}</h1>
        <p className="text-sm text-muted-foreground">
          <span className="font-mono">{organization.slug}</span> · created{" "}
          {new Date(organization.created_at).toLocaleString()}
        </p>
      </div>

      <div className="border rounded-xl p-4 sm:p-6 space-y-4 bg-surface">
        <OrganizationForm
          key={`${organization.id}-${organization.name}`}
          action={updateOrganization.bind(null, organization.id)}
          organization={organization}
          submit_label="Save"
          confirm_message={`Save changes to "${organization.name}"?`}
          confirm_submessage="Your organization details will be updated."
        />
      </div>

      {demo_enabled && (
        <div className="border border-success/40 rounded-xl p-4 sm:p-6 space-y-4 bg-success/5">
          <h2 className="font-semibold text-success text-base">Demo</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm">Load sample data</h3>
              <p className="text-sm text-muted-foreground">
                Adds the 5-product catalog and sample inspections that this organization is
                missing. Nothing is deleted.
              </p>
            </div>
            
            <ActionForm action={loadDemoData.bind(null, organization.id)} className="flex justify-end w-full">
              <ConfirmSubmitButton
                message={`Load demo data into "${organization.name}"?`}
                submessage="Missing catalog products and sample inspections will be added. Existing data is kept."
                class_name="px-5 py-2 rounded-full text-sm font-semibold bg-success text-success-foreground hover:bg-success/90 shadow-sm transition-colors"
              >
                Load
              </ConfirmSubmitButton>
            </ActionForm>
          </div>
        </div>
      )}

      <div className="border border-danger/40 rounded-xl p-4 sm:p-6 space-y-6 bg-danger/5">
        <h2 className="font-semibold text-danger text-base">Danger</h2>

        {demo_enabled && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm">Reset to demo data</h3>
              <p className="text-sm text-muted-foreground">
                Deletes all products and inspections of this organization and restores the
                initial catalog with sample inspections. Other organizations are not affected.
              </p>
            </div>
            <ActionForm action={resetDemoData.bind(null, organization.id)} className="flex justify-end w-full">
              <ConfirmSubmitButton
                message={`Reset "${organization.name}" to demo data?`}
                submessage="All its products and inspections will be deleted and replaced with the initial demo data."
                class_name="px-5 py-2 rounded-full text-sm font-semibold bg-danger text-white hover:bg-danger/85 transition-colors shadow-sm"
                confirm_class_name="bg-danger text-white hover:bg-danger/85"
              >
                Reset
              </ConfirmSubmitButton>
            </ActionForm>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm">Delete organization</h3>
            <p className="text-sm text-muted-foreground">
              This action is irreversible. Please be certain.
            </p>
          </div>
          
          <ActionForm action={deleteOrganization.bind(null, organization.id)} className="flex justify-end w-full">
            <ConfirmSubmitButton
              message={`Delete "${organization.name}"?`}
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
