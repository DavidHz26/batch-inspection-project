import { Suspense } from "react";
import Link from "next/link";
import { InspectionTable } from "./inspection-table";

export default function InspectionsPage({ searchParams }: {
  searchParams: Promise<{ productId?: string; status?: string; page?: string; pageSize?: string }>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Inspections</h1>
        <Link href="/inspections/new" className="underline text-sm">
          New inspection
        </Link>
      </div>

      <Suspense fallback={<p>Loading inspections...</p>}>
        <InspectionTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
