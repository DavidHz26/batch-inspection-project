import { ClickableRow } from "@/app/clickable-row";
import { Alert } from "@/app/alert";
import { getCurrentOrganizationId, getOrganizationsPage } from "@/lib/organization";
import { parsePagination, type PaginationParams } from "@/lib/pagination";
import {
  PageSizeForm,
  Pagination,
  ScrollTable,
  SCROLL_TABLE_HEAD_CLASS,
} from "@/app/pagination";

export async function OrganizationTable({ search_params }: {
  search_params: Promise<PaginationParams>;
}) {
  const { page, page_size } = parsePagination(await search_params);

  const [{ data: organizations, count }, current_id] = await Promise.all([
    getOrganizationsPage(page, page_size),
    getCurrentOrganizationId(),
  ]);

  if (count === 0) {
    console.info("[organizations] No hay organizaciones para mostrar");
    return <Alert variant="info">No organizations registered.</Alert>;
  }

  return (
    <>
      <PageSizeForm page_size={page_size} />

      <ScrollTable>
        <thead className={SCROLL_TABLE_HEAD_CLASS}>
          <tr className="border-b">
            <th className="w-12 p-2 text-left">#</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Slug</th>
            <th className="p-2 text-left">Created At</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org, index) => (
            <ClickableRow
              key={org.id}
              href={`/organizations/${org.id}/edit`}
              label={`Edit ${org.name}`}
              class_name="border-b"
            >
              <td className="p-2 text-muted-foreground font-mono">
                {(page - 1) * page_size + index + 1}
              </td>
              <td className="p-2">
                {org.name}
                {org.id === current_id && (
                  <span className="ml-2 rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">
                    Current
                  </span>
                )}
              </td>
              <td className="p-2 font-mono text-xs">{org.slug}</td>
              <td className="p-2">
                {new Date(org.created_at).toLocaleDateString()}
              </td>
            </ClickableRow>
          ))}
        </tbody>
      </ScrollTable>

      <Pagination
        base_path="/organizations"
        page={page}
        page_size={page_size}
        count={count}
      />
    </>
  );
}
