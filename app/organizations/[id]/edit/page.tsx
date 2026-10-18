import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrganization } from "@/lib/organization";
import { ConfirmSubmitButton } from "@/app/confirm-submit-button";
import { deleteOrganization, updateOrganization } from "../../actions";
import { OrganizationForm } from "../../organization-form";

export default function EditOrganizationPage({
  params,
}: PageProps<"/organizations/[id]/edit">) {
  return (
    <Suspense fallback={<p>Loading organization...</p>}>
      <EditOrganization params={params} />
    </Suspense>
  );
}

async function EditOrganization({
  params,
}: Pick<PageProps<"/organizations/[id]/edit">, "params">) {
  const { id } = await params;
  const organization = await getOrganization(id);
  if (!organization) notFound();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Edit {organization.name}</h1>
        <OrganizationForm
          key={`${organization.id}-${organization.name}`}
          action={updateOrganization.bind(null, organization.id)}
          organization={organization}
          submitLabel="Save"
        />
      </div>

      <section className="space-y-2 border-t pt-4">
        <h2 className="font-semibold text-red-700">Delete organization</h2>
        <p className="text-sm text-gray-500">This action cannot be undone.</p>
        <form action={deleteOrganization.bind(null, organization.id)}>
          <ConfirmSubmitButton
            message={`Delete "${organization.name}"? This action cannot be undone.`}
            className="bg-red-700"
          >
            Delete
          </ConfirmSubmitButton>
        </form>
      </section>
    </div>
  );
}
