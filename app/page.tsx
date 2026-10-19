import { Suspense } from "react";
import { Alert } from "@/app/alert";
import { Loading } from "@/app/loading-text";
import { getCurrentOrganizationId } from "@/lib/organization";
import { calculateGlobalMetrics } from "@/lib/quality-calculator";
import { getInspectionUnits } from "@/lib/inspections";
import { MetricsCards } from "@/app/metrics-cards";

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
  return <MetricsCards metrics={calculateGlobalMetrics(inspections)} />;
}
