"use client";

import type { Organization } from "@/lib/types";
import { selectOrganization } from "@/app/organizations/actions";

export function OrganizationSelector({
  organizations,
  currentId,
}: {
  organizations: Organization[];
  currentId: string | null;
}) {
  if (organizations.length === 0) {
    return <span className="text-sm text-gray-500">No organizations registered.</span>;
  }

  return (
    <form action={selectOrganization}>
      <select
        key={currentId}
        name="organization_id"
        defaultValue={currentId ?? undefined}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="text-sm"
        aria-label="Organización"
      >
        {organizations.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </form>
  );
}
