import type { InspectionStatus } from "@/lib/types";

const styles: Record<InspectionStatus, string> = {
  Approved: "bg-success/15 text-success ring-success/40",
  Observations: "bg-warning/15 text-warning ring-warning/40",
  Rejected: "bg-danger/15 text-danger ring-danger/40",
};

export function StatusBadge({ status }: { status: InspectionStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  );
}
