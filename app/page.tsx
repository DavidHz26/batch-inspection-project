import { Suspense } from "react";
import { Alert } from "@/app/alert";
import { Loading } from "@/app/loading-text";
import { getCurrentOrganizationId } from "@/lib/organization";
import { calculateGlobalMetrics } from "@/lib/quality-calculator";
import { getInspectionUnits } from "@/lib/inspections";
import { MetricsCards } from "@/app/metrics-cards";
import { DefectsBarChart } from "@/app/bar-chart";
import { QualityPieChart } from "@/app/pie-chart";
import { QualityTrendChart } from "./trend-chart";
import { RecentInspectionsList } from "@/app/recent-inspections";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Summary</h1>
      <Suspense fallback={<Loading label="summary" />}>
        <Summary />
      </Suspense>
    </div>
  );
}

async function Summary() {
  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) {
    return <Alert variant="warning">Select an organization to see its summary.</Alert>;
  }

  const inspections = await getInspectionUnits();
  const metrics = calculateGlobalMetrics(inspections);

  const barChartData = inspections.map((inspection, index) => ({
    name: `#${index + 1}`,
    defects: inspection.units_defective,
    inspected: inspection.units_inspected,
    defective: inspection.units_defective,
  }));

  const goodUnits = metrics.total_inspected_units - metrics.total_defective_units;
  const pieChartData = [
    { name: "Approved Units", value: goodUnits, color: "#22c55e" },
    { name: "Defective Units", value: metrics.total_defective_units, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <MetricsCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DefectsBarChart data={barChartData} />
        <QualityTrendChart data={barChartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QualityPieChart data={pieChartData} />
        <RecentInspectionsList inspections={inspections} />
      </div>
    </div>
  );
}