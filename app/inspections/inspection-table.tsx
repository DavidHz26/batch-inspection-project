import Link from "next/link";
import { ClickableRow } from "@/app/clickable-row";
import { DefectPercentage } from "./defect-percentage";
import { Alert } from "@/app/alert";
import { getInspections, getInspectionUnits } from "@/lib/inspections";
import { calculateGlobalMetrics, INSPECTION_STATUSES } from "@/lib/quality-calculator";
import { MetricsCards } from "@/app/metrics-cards";
import { parsePagination, type PaginationParams } from "@/lib/pagination";
import { StatusBadge } from "@/app/status-badge";
import {
  PageSizeSelect,
  Pagination,
  ScrollTable,
  SCROLL_TABLE_HEAD_CLASS,
} from "@/app/pagination";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getProducts } from "@/lib/products";

export async function InspectionTable({ search_params }: {
  search_params: Promise<{ product_id?: string; status?: string } & PaginationParams>;
}) {
  const resolved_params = await search_params;

  const product_id = typeof resolved_params?.product_id === "string" ? resolved_params.product_id : undefined;
  const status = typeof resolved_params?.status === "string" ? resolved_params.status : undefined;
  const { page, page_size } = parsePagination(resolved_params);

  const filters = { product_id, status };

  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) {
    return <Alert variant="warning">Select an organization to see its inspections.</Alert>;
  }

  const [products, { data: inspections, count }, filtered_units] = await Promise.all([
    getProducts(organization_id),
    getInspections(filters, page, page_size),
    getInspectionUnits(filters),
  ]);
  const metrics = calculateGlobalMetrics(filtered_units);
  const has_filters = Boolean(product_id || status);

  return (
    <>
      <form className="flex flex-wrap gap-3 items-end text-sm mb-4">
    
        <label className="grid gap-1 w-full sm:w-auto">
          Product

          {/* El key vuelve a montar el select cuando cambia la URL: con cacheComponents,
              Next conserva el DOM de la página al navegar y defaultValue no se volvería a aplicar. */}
          <select key={product_id ?? ""} name="product_id" defaultValue={product_id ?? ""} className="w-full sm:max-w-xs">
            <option value="">All</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.sku} - {product.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          Status
          <select key={status ?? ""} name="status" defaultValue={status ?? ""}>
            <option value="">All</option>
            {INSPECTION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {product_id && <input type="hidden" name="current_product_id" value={product_id} />}
        {status && <input type="hidden" name="current_status" value={status} />}

        <PageSizeSelect page_size={page_size} />

        <div className="flex gap-2 items-center">
          <button type="submit" className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground">
            Filter
          </button>

          {has_filters && (
            <Link
              href="/inspections"
              className="px-4 py-1.5 rounded-full border text-sm bg-surface-raised hover:bg-muted"
            >
              Clean
            </Link>
          )}
        </div>
      </form>

      <div className="mb-4">
        <MetricsCards
          metrics={metrics}
          title={has_filters ? "Filtered results" : "All inspections"}
        />
      </div>

      {inspections.length === 0 ? (
        has_filters ? (
          <Alert variant="info" title="No results">
            No inspections match the selected filters.{" "}
            <Link href="/inspections" className="underline">
              Clean filters
            </Link>
          </Alert>
        ) : (
          <Alert variant="info">No inspections registered.</Alert>
        )
      ) : (
        <>
          <ScrollTable>
            <thead className={SCROLL_TABLE_HEAD_CLASS}>
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
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection, index) => {
                const row_number = (page - 1) * page_size + index + 1;

                return (
                  <ClickableRow
                    key={inspection.id}
                    href={`/inspections/${inspection.id}/edit`}
                    label={`Edit inspection of batch ${inspection.batch_number}`}
                    class_name="border-b"
                  >
                    <td className="p-2 text-muted-foreground font-mono">{row_number}</td>
                    <td className="p-2">{inspection.inspection_date}</td>
                    <td className="p-2">
                      {inspection.products
                        ? `${inspection.products.sku} - ${inspection.products.name}`
                        : "-"}
                    </td>
                    <td className="p-2">{inspection.batch_number}</td>
                    <td className="p-2">{inspection.units_inspected}</td>
                    <td className="p-2">{inspection.units_defective}</td>
                    <td className="p-2">
                      <DefectPercentage
                        units_inspected={inspection.units_inspected}
                        units_defective={inspection.units_defective}
                        defect_percentage={inspection.defect_percentage}
                      />
                    </td>
                    <td className="p-2">
                      <StatusBadge status={inspection.status} />
                    </td>
                    <td className="p-2">{inspection.inspector_name ?? "-"}</td>
                  </ClickableRow>
                );
              })}
            </tbody>
          </ScrollTable>

          <Pagination
            base_path="/inspections"
            page={page}
            page_size={page_size}
            count={count}
            params={{ product_id, status }}
          />
        </>
      )}
    </>
  );
}
