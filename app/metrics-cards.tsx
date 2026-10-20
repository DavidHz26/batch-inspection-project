import { getInspectionStatus } from "@/lib/quality-calculator";
import type { GlobalMetrics, InspectionStatus } from "@/lib/types";

const STATUS_ACCENT: Record<InspectionStatus, string> = {
  Approved: "bg-success text-black",
  Observations: "bg-warning text-black",
  Rejected: "bg-danger text-white",
};

// Tarjetas de métricas
// Vacío el % se muestra como "No data"
export function MetricsCards({
  metrics,
  title,
}: {
  metrics: GlobalMetrics;
  title?: string;
}) {
  const has_data =
    metrics.total_inspections > 0 && metrics.global_defect_percentage !== null;

  const global_status = has_data
    ? getInspectionStatus(
        (metrics.total_defective_units / metrics.total_inspected_units) * 100,
      )
    : null;

  const stats: { label: string; value: string | number; accent: string }[] = [
    { label: "Inspections", value: metrics.total_inspections, accent: "bg-primary text-white" },
    { label: "Units inspected", value: metrics.total_inspected_units, accent: "bg-surface-raised text-foreground" },
    { label: "Units defective", value: metrics.total_defective_units, accent: "bg-surface-raised text-foreground" },
    {
      label: "Global % defects",
      value: has_data ? `${metrics.global_defect_percentage}%` : "No data",
      accent: global_status ? STATUS_ACCENT[global_status] : "bg-surface-raised text-muted-foreground",
    },
  ];

  return (
    <section aria-label={title ?? "Metrics"} className="space-y-2">
      {title && <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, accent }) => (
          <div key={label} className="rounded-xl border bg-surface overflow-hidden">
            <dt className={`px-3 py-1 text-xs font-semibold ${accent}`}>{label}</dt>
            <dd className="px-3 py-3 text-2xl sm:text-3xl font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
