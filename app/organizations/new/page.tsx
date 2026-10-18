import { createOrganization } from "../actions";
import { OrganizationForm } from "../organization-form";

export default function NewOrganizationPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Organization</h1>
      <OrganizationForm action={createOrganization} submitLabel="Create" />
    </div>
  );
}
