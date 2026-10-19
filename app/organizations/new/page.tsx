import { createOrganization } from "../actions";
import { OrganizationForm } from "../organization-form";

export default function NewOrganizationPage() {
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold">New Organization</h1>
        <p className="text-sm text-muted-foreground">
          It will become the active organization once created.
        </p>
      </div>

      <div className="border rounded-xl p-4 sm:p-6 space-y-4 bg-surface">
        <OrganizationForm
          action={createOrganization}
          submit_label="Create"
          confirm_message="Create organization?"
          confirm_submessage="The new organization will be selected as the active one."
        />
      </div>
    </div>
  );
}
