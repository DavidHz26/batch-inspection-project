import Link from "next/link";
import { getInspections } from "@/lib/inspections";
import { INSPECTION_STATUSES } from "@/lib/quality-calculator";
import type { InspectionFilters } from "@/lib/types";
import { StatusBadge } from "@/app/status-badge";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getProducts } from "@/lib/products";

export async function InspectionTable({
  filters,
}: {
  filters: Promise<InspectionFilters>;
}) {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return <p>Select an organization to see its inspections.</p>;
  }

  const { productId, status } = await filters;
  const [products, inspections] = await Promise.all([
    getProducts(organizationId),
    getInspections(organizationId, { productId, status }),
  ]);

  if (inspections.length === 0) {
    console.info("[inspections] No hay inspecciones para mostrar");
  }

  return (
    <>
      <form className="flex gap-3 items-end text-sm">
        <label className="grid gap-1">
          Product
          <select name="productId" defaultValue={productId ?? ""}>
            <option value="">All</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.sku} — {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          Status
          <select name="status" defaultValue={status ?? ""}>
            <option value="">All</option>
            {INSPECTION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Filter</button>
      </form>

      {inspections.length === 0 ? (
        <p>No inspections registered.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Batch</th>
              <th>Inspected</th>
              <th>Defective</th>
              <th>% Defects</th>
              <th>Status</th>
              <th>Inspector</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((inspection) => (
              <tr key={inspection.id}>
                <td>{inspection.inspection_date}</td>
                <td>
                  {inspection.products
                    ? `${inspection.products.sku} — ${inspection.products.name}`
                    : "—"}
                </td>
                <td>
                  <Link
                    href={`/inspections/${inspection.id}`}
                    className="underline"
                  >
                    {inspection.batch_number}
                  </Link>
                </td>
                <td>{inspection.units_inspected}</td>
                <td>{inspection.units_defective}</td>
                <td>{inspection.defect_percentage}%</td>
                <td>
                  <StatusBadge status={inspection.status} />
                </td>
                <td>{inspection.inspector_name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
