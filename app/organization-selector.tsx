"use client";

import type { Organization } from "@/lib/types";
import { selectOrganization } from "@/app/organizations/actions";

export function OrganizationSelector({ organizations, current_id }: {
  organizations: Organization[];
  current_id: string | null;
}) {
  if (organizations.length === 0) {
    return <span className="text-sm text-gray-500">No organizations registered.</span>;
  }

  return (
    <form action={selectOrganization}>
      <select
        key={current_id}
        name="organization_id"
        defaultValue={current_id ?? undefined}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="text-sm max-w-48 sm:max-w-xs"
        aria-label="Organización"
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </form>
  );
}
