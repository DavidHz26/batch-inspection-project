import type { GlobalMetrics } from "@/lib/types";

export function MetricsCards({
  metrics,
  title,
}: {
  metrics: GlobalMetrics;
  title?: string;
}) {
  const has_data = metrics.total_inspections > 0;

  const stats = [
    ["Inspections", metrics.total_inspections],
    ["Units inspected", metrics.total_inspected_units],
    ["Units defective", metrics.total_defective_units],
    [
      "Global % defects",
      has_data && metrics.global_defect_percentage !== null
        ? `${metrics.global_defect_percentage}%`
        : "No data",
    ],
  ] as const;

  return (
    <section aria-label={title ?? "Metrics"} className="space-y-2">
      {title && <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(([label, value]) => (
          <div key={label} className="border rounded p-3 sm:p-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-xl sm:text-2xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
