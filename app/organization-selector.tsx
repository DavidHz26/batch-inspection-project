"use client";

import type { Organization } from "@/lib/types";
import { selectOrganization } from "@/app/organizations/actions";

export function OrganizationSelector({ organizations, current_id }: {
  organizations: Organization[];
  current_id: string | null;
}) {
  if (organizations.length === 0) {
    return <span className="text-sm text-muted-foreground">No organizations registered.</span>;
  }

  return (
    <form action={selectOrganization} className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline">
        Org:
      </span>
      <div className="relative">
        <select
          key={current_id}
          name="organization_id"
          defaultValue={current_id ?? undefined}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="appearance-none text-sm px-3 py-1.5 pr-8 rounded-lg border border-border bg-surface text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer max-w-48 sm:max-w-xs"
          aria-label="Organización"
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id} className="bg-surface text-foreground">
              {org.name}
            </option>
          ))}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </form>
  );
}
