import { Suspense } from "react";
import Link from "next/link";
import { OrganizationTable } from "./organization-table";

export default function OrganizationsPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Organizations</h1>
        <Link href="/organizations/new" className="underline text-sm">
          New organization
        </Link>
      </div>

      <Suspense fallback={<p>Loading organizations...</p>}>
        <OrganizationTable />
      </Suspense>
    </div>
  );
}
