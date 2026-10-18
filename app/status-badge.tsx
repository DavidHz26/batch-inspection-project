import type { InspectionStatus } from "@/lib/types";

const styles: Record<InspectionStatus, string> = {
  Approved: "bg-green-100 text-green-800",
  Observations: "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: InspectionStatus }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs ${styles[status]}`}>
      {status}
    </span>
  );
}
