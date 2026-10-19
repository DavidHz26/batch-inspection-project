import { ClickableRow } from "@/app/clickable-row";
import { Alert } from "@/app/alert";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getProductsPage } from "@/lib/products";
import { parsePagination, type PaginationParams } from "@/lib/pagination";
import {
  PageSizeForm,
  Pagination,
  ScrollTable,
  SCROLL_TABLE_HEAD_CLASS,
} from "@/app/pagination";

export async function ProductTable({ search_params }: {
  search_params: Promise<PaginationParams>;
}) {
  const resolved_params = await search_params;
  const { page, page_size } = parsePagination(resolved_params);

  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) {
    return <Alert variant="warning">Select an organization to see its products.</Alert>;
  }

  const { data: products, count } = await getProductsPage(
    organization_id,
    page,
    page_size,
  );

  return (
    <>
      <PageSizeForm page_size={page_size} />

      {products.length === 0 ? (
        <Alert variant="info">No products registered.</Alert>
      ) : (
        <>
          <ScrollTable>
            <thead className={SCROLL_TABLE_HEAD_CLASS}>
              <tr className="border-b">
                <th className="w-12 p-2 text-left">#</th>
                <th className="p-2 text-left">SKU</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Created At</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const row_number = (page - 1) * page_size + index + 1;

                return (
                  <ClickableRow
                    key={product.id}
                    href={`/products/${product.id}/edit`}
                    label={`Edit ${product.name}`}
                    class_name="border-b"
                  >
                    <td className="p-2 text-muted-foreground font-mono">{row_number}</td>
                    <td className="p-2 font-mono text-xs">{product.sku}</td>
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          product.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-2">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                  </ClickableRow>
                );
              })}
            </tbody>
          </ScrollTable>

          <Pagination
            base_path="/products"
            page={page}
            page_size={page_size}
            count={count}
          />
        </>
      )}
    </>
  );
}
