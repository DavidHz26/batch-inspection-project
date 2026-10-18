import { Suspense } from "react";
import Link from "next/link";
import type { InspectionFilters } from "@/lib/types";
import { InspectionTable } from "./inspection-table";

export default function InspectionsPage({
  searchParams,
}: PageProps<"/inspections">) {
  const filters: Promise<InspectionFilters> = searchParams.then(
    ({ productId, status }) => ({
      productId: typeof productId === "string" ? productId : undefined,
      status: typeof status === "string" ? status : undefined,
    }),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Inspections</h1>
        <Link href="/inspections/new" className="underline text-sm">
          New inspection
        </Link>
      </div>

      <Suspense fallback={<p>Loading inspections...</p>}>
        <InspectionTable filters={filters} />
      </Suspense>
    </div>
  );
}
