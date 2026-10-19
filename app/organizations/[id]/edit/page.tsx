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
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Edit {organization.name}</h1>
        <p className="text-sm text-gray-500">
          <span className="font-mono">{organization.slug}</span> · created{" "}
          {new Date(organization.created_at).toLocaleString()}
        </p>
      </div>

      <div className="border rounded-lg p-4 sm:p-6 space-y-4 bg-background">
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
        <div className="border rounded-lg p-4 sm:p-6 space-y-4 bg-background">
          <div>
            <h2 className="font-semibold text-base">Demo data</h2>
            <p className="text-sm text-muted-foreground">
              Adds the 5-product catalog and sample inspections that this organization is
              missing. Nothing is deleted.
            </p>
          </div>
          <ActionForm action={loadDemoData.bind(null, organization.id)}>
            <ConfirmSubmitButton
              message={`Load demo data into "${organization.name}"?`}
              submessage="Missing catalog products and sample inspections will be added. Existing data is kept."
              class_name="px-3.5 py-1.5 rounded text-sm bg-primary text-primary-foreground"
            >
              Load
            </ConfirmSubmitButton>
          </ActionForm>
        </div>
      )}

      <div className="border border-red-900/30 rounded-lg p-4 sm:p-6 space-y-6 bg-red-950/10">
        <h2 className="font-semibold text-red-700 text-base">Danger</h2>

        {demo_enabled && (
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-sm">Reset to demo data</h3>
              <p className="text-sm text-muted-foreground">
                Deletes all products and inspections of this organization and restores the
                initial catalog with sample inspections. Other organizations are not affected.
              </p>
            </div>
            <ActionForm action={resetDemoData.bind(null, organization.id)}>
              <ConfirmSubmitButton
                message={`Reset "${organization.name}" to demo data?`}
                submessage="All its products and inspections will be deleted and replaced with the initial demo data."
                class_name="px-3.5 py-1.5 rounded text-sm bg-red-700 text-white hover:bg-red-800 transition-colors"
                confirm_class_name="bg-red-700 text-white hover:bg-red-800"
              >
                Reset
              </ConfirmSubmitButton>
            </ActionForm>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-sm">Delete organization</h3>
            <p className="text-sm text-muted-foreground">
              This action is irreversible. Please be certain.
            </p>
          </div>
          
          <ActionForm action={deleteOrganization.bind(null, organization.id)}>
            <ConfirmSubmitButton
              message={`Delete "${organization.name}"?`}
              submessage="This action is permanent and cannot be reversed."
              class_name="px-3.5 py-1.5 rounded text-sm bg-red-700 text-white hover:bg-red-800 transition-colors"
              confirm_class_name="bg-red-700 text-white hover:bg-red-800"
            >
              Delete
            </ConfirmSubmitButton>
          </ActionForm>
        </div>
      </div>
    </div>
  );
}
