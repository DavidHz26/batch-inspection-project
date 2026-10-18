import Link from "next/link";
import { getCurrentOrganizationId, getOrganizationsPage } from "@/lib/organization";
import { parsePagination, type PaginationParams } from "@/lib/pagination";
import {
  PageSizeForm,
  Pagination,
  ScrollTable,
  scrollTableHeadClass,
} from "@/app/pagination";

export async function OrganizationTable({ searchParams }: {
  searchParams: Promise<PaginationParams>;
}) {
  const { page, pageSize } = parsePagination(await searchParams);

  const [{ data: organizations, count }, currentId] = await Promise.all([
    getOrganizationsPage(page, pageSize),
    getCurrentOrganizationId(),
  ]);

  if (count === 0) {
    console.info("[organizations] No hay organizaciones para mostrar");
    return <p> No organizations registered. </p>;
  }

  return (
    <>
      <PageSizeForm pageSize={pageSize} />

      <ScrollTable>
        <thead className={scrollTableHeadClass}>
          <tr className="border-b">
            <th className="w-12 p-2 text-left">#</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Slug</th>
            <th className="p-2 text-left">Created At</th>
            <th className="p-2 text-right"></th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org, index) => (
            <tr key={org.id} className="border-b hover:bg-muted/50">
              <td className="p-2 text-muted-foreground font-mono">
                {(page - 1) * pageSize + index + 1}
              </td>
              <td className="p-2">
                {org.name}
                {org.id === currentId && (
                  <span className="ml-2 rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">
                    Current
                  </span>
                )}
              </td>
              <td className="p-2 font-mono text-xs">{org.slug}</td>
              <td className="p-2">
                {new Date(org.created_at).toLocaleDateString()}
              </td>
              <td className="p-2 text-right">
                <Link
                  href={`/organizations/${org.id}/edit`}
                  className="underline text-sm"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </ScrollTable>

      <Pagination
        basePath="/organizations"
        page={page}
        pageSize={pageSize}
        count={count}
      />
    </>
  );
}
