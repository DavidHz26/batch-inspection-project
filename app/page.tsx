import { Suspense } from "react";
import { getCurrentOrganizationId } from "@/lib/organization";
import { calculateGlobalMetrics } from "@/lib/quality-calculator";
import { getInspections } from "@/lib/inspections";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Summary</h1>
      <Suspense fallback={<p>Loading summary...</p>}>
        <Summary />
      </Suspense>
    </div>
  );
}

async function Summary() {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return <p>Select an organization to see its summary.</p>;

  const inspections = await getInspections(organizationId);
  const metrics = calculateGlobalMetrics(inspections);

  const stats = [
    ["Inspections", metrics.totalInspections],
    ["Units inspected", metrics.totalInspectedUnits],
    ["Units defective", metrics.totalDefectiveUnits],
    [
      "Global % defects",
      metrics.globalDefectPercentage === null
        ? "—"
        : `${metrics.globalDefectPercentage}%`,
    ],
  ] as const;

  return (
    <dl className="grid grid-cols-4 gap-4">
      {stats.map(([label, value]) => (
        <div key={label} className="border rounded p-4">
          <dt className="text-sm text-gray-500">{label}</dt>
          <dd className="text-2xl font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
