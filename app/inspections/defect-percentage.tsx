import { exactDefectPercentage, isRoundingMisleading } from "@/lib/quality-calculator";

// Muestra el porcentaje de defectos y resalta con un indicador si el redondeo difiere del valor exacto.
export function DefectPercentage({
  units_inspected,
  units_defective,
  defect_percentage,
}: {
  units_inspected: number;
  units_defective: number;
  defect_percentage: number;
}) {
  if (!isRoundingMisleading(units_inspected, units_defective)) {
    return <>{defect_percentage}%</>;
  }

  const exact = exactDefectPercentage(units_inspected, units_defective);
  return (
    <abbr
      title={`Exact: ${exact}% (${units_defective}/${units_inspected}). Status uses the exact value.`}
      className="underline decoration-dotted decoration-amber-600 underline-offset-2 cursor-help"
    >
      {defect_percentage}%<span aria-hidden className="ml-0.5 text-amber-600">*</span>
    </abbr>
  );
}
