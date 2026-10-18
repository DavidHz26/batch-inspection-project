import Link from "next/link";
import { getCurrentOrganizationId, getOrganizations } from "@/lib/organization";

export async function OrganizationTable() {
  const [organizations, currentId] = await Promise.all([
    getOrganizations(),
    getCurrentOrganizationId(),
  ]);

  if (organizations.length === 0) {
    console.info("[organizations] No hay organizaciones para mostrar");
    return (
      <p>
        No organizations registered.{" "}
        <Link href="/organizations/new" className="underline">
          Create the first one
        </Link>
        .
      </p>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Slug</th>
          <th>Created At</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {organizations.map((org) => (
          <tr key={org.id}>
            <td>
              {org.name}
              {org.id === currentId && (
                <span className="ml-2 rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">
                  Current
                </span>
              )}
            </td>
            <td className="font-mono text-xs">{org.slug}</td>
            <td>{new Date(org.created_at).toLocaleDateString()}</td>
            <td className="text-right">
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
    </table>
  );
}
