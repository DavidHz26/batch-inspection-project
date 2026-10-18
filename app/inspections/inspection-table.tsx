import Link from "next/link";
import { getInspections } from "@/lib/inspections";
import { INSPECTION_STATUSES } from "@/lib/quality-calculator";
import { parsePagination, type PaginationParams } from "@/lib/pagination";
import { StatusBadge } from "@/app/status-badge";
import {
  PageSizeSelect,
  Pagination,
  ScrollTable,
  scrollTableHeadClass,
} from "@/app/pagination";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getProducts } from "@/lib/products";

export async function InspectionTable({ searchParams }: {
  searchParams: Promise<{ productId?: string; status?: string } & PaginationParams>;
}) {
  const resolvedParams = await searchParams;

  const productId = typeof resolvedParams?.productId === "string" ? resolvedParams.productId : undefined;
  const status = typeof resolvedParams?.status === "string" ? resolvedParams.status : undefined;
  const { page, pageSize } = parsePagination(resolvedParams);

  const filters = { productId, status };

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return <p> Select an organization to see its inspections. </p>;
  }

  const [products, { data: inspections, count }] = await Promise.all([
    getProducts(organizationId),
    getInspections(filters, page, pageSize),
  ]);

  return (
    <>
      <form className="flex flex-wrap gap-3 items-end text-sm mb-4">
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

        <PageSizeSelect pageSize={pageSize} />

        <button type="submit" className="px-3 py-1.5 border rounded bg-primary text-primary-foreground">
          Filter
        </button>
      </form>

      {inspections.length === 0 ? (
        <p>No inspections registered.</p>
      ) : (
        <>
          <ScrollTable>
            <thead className={scrollTableHeadClass}>
              <tr className="border-b">
                <th className="w-12 p-2 text-left">#</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Batch</th>
                <th className="p-2 text-left">Inspected</th>
                <th className="p-2 text-left">Defective</th>
                <th className="p-2 text-left">% Defects</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Inspector</th>
                <th className="p-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection, index) => {
                const rowNumber = (page - 1) * pageSize + index + 1;

                return (
                  <tr key={inspection.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 text-muted-foreground font-mono">{rowNumber}</td>
                    <td className="p-2">{inspection.inspection_date}</td>
                    <td className="p-2">
                      {inspection.products
                        ? `${inspection.products.sku} — ${inspection.products.name}`
                        : "—"}
                    </td>
                    <td className="p-2">{inspection.batch_number}</td>
                    <td className="p-2">{inspection.units_inspected}</td>
                    <td className="p-2">{inspection.units_defective}</td>
                    <td className="p-2">{inspection.defect_percentage}%</td>
                    <td className="p-2">
                      <StatusBadge status={inspection.status} />
                    </td>
                    <td className="p-2">{inspection.inspector_name ?? "—"}</td>
                    <td className="p-2 text-right">
                      <Link
                        href={`/inspections/${inspection.id}/edit`}
                        className="underline text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </ScrollTable>

          <Pagination
            basePath="/inspections"
            page={page}
            pageSize={pageSize}
            count={count}
            params={{ productId, status }}
          />
        </>
      )}
    </>
  );
}
