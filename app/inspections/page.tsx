import { Suspense } from "react";
import { Loading } from "@/app/loading-text";
import Link from "next/link";
import { InspectionTable } from "./inspection-table";

export default function InspectionsPage({ searchParams }: {
  searchParams: Promise<{ product_id?: string; status?: string; page?: string; page_size?: string }>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-xl font-semibold">Inspections</h1>
        <Link href="/inspections/new" className="underline text-sm">
          New inspection
        </Link>
      </div>

      <Suspense fallback={<Loading label="inspections" />}>
        <InspectionTable search_params={searchParams} />
      </Suspense>
    </div>
  );
}
