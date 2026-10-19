import { Suspense } from "react";
import { Loading } from "@/app/loading-text";
import Link from "next/link";
import type { PaginationParams } from "@/lib/pagination";
import { OrganizationTable } from "./organization-table";

export default function OrganizationsPage({ searchParams }: {
  searchParams: Promise<PaginationParams>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-xl font-semibold">Organizations</h1>
        <Link href="/organizations/new" className="underline text-sm">
          New organization
        </Link>
      </div>

      <Suspense fallback={<Loading label="organizations" />}>
        <OrganizationTable search_params={searchParams} />
      </Suspense>
    </div>
  );
}
