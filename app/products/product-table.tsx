import Link from "next/link";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getProductsPage } from "@/lib/products";
import { parsePagination, type PaginationParams } from "@/lib/pagination";
import {
  PageSizeForm,
  Pagination,
  ScrollTable,
  scrollTableHeadClass,
} from "@/app/pagination";

export async function ProductTable({ searchParams }: {
  searchParams: Promise<PaginationParams>;
}) {
  const resolvedParams = await searchParams;
  const { page, pageSize } = parsePagination(resolvedParams);

  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) {
    return <p>Select an organization to see its products.</p>;
  }

  const { data: products, count } = await getProductsPage(
    organizationId,
    page,
    pageSize,
  );

  return (
    <>
      <PageSizeForm pageSize={pageSize} />

      {products.length === 0 ? (
        <p>No products registered.</p>
      ) : (
        <>
          <ScrollTable>
            <thead className={scrollTableHeadClass}>
              <tr className="border-b">
                <th className="w-12 p-2 text-left">#</th>
                <th className="p-2 text-left">SKU</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Created At</th>
                <th className="p-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const rowNumber = (page - 1) * pageSize + index + 1;

                return (
                  <tr key={product.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 text-muted-foreground font-mono">{rowNumber}</td>
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
                    <td className="p-2 text-right">
                      <Link
                        href={`/products/${product.id}/edit`}
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
            basePath="/products"
            page={page}
            pageSize={pageSize}
            count={count}
          />
        </>
      )}
    </>
  );
}
