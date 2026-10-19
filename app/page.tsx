import { Suspense } from "react";
import { Alert } from "@/app/alert";
import { Loading } from "@/app/loading-text";
import { getCurrentOrganizationId } from "@/lib/organization";
import { calculateGlobalMetrics } from "@/lib/quality-calculator";
import { getInspectionUnits } from "@/lib/inspections";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Summary</h1>
      <Suspense fallback={<Loading label="summary" />}>
        <Summary />
      </Suspense>
    </div>
  );
}

async function Summary() {
  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) return <Alert variant="warning">Select an organization to see its summary.</Alert>;

  const inspections = await getInspectionUnits();
  const metrics = calculateGlobalMetrics(inspections);

  const stats = [
    ["Inspections", metrics.total_inspections],
    ["Units inspected", metrics.total_inspected_units],
    ["Units defective", metrics.total_defective_units],
    [
      "Global % defects",
      metrics.global_defect_percentage === null
        ? "—"
        : `${metrics.global_defect_percentage}%`,
    ],
  ] as const;

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {stats.map(([label, value]) => (
        <div key={label} className="border rounded p-4">
          <dt className="text-sm text-gray-500">{label}</dt>
          <dd className="text-2xl font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
