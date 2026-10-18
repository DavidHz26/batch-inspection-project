import type { NextRequest } from "next/server";
import {
  deleteOrganization,
  getOrganization,
  updateOrganization,
} from "@/lib/organization";
import { parseOrganization } from "@/lib/validation";
import { handleApiError, readJson } from "@/app/api/utils";

type Context = RouteContext<"/api/organizations/[id]">;

function notFound() {
  return Response.json({ error: "Organization not found" }, { status: 404 });
}

// GET /api/organizations/{id}
export async function GET(_request: NextRequest, ctx: Context) {
  const { id } = await ctx.params;
  const organization = await getOrganization(id);
  return organization ? Response.json(organization) : notFound();
}

// PUT /api/organizations/{id}
export async function PUT(request: NextRequest, ctx: Context) {
  const { id } = await ctx.params;
  if (!(await getOrganization(id))) return notFound();

  try {
    const input = parseOrganization(await readJson(request));
    return Response.json(await updateOrganization(id, input));
  } catch (error) {
    return handleApiError(error, "Could not update the organization");
  }
}

// DELETE /api/organizations/{id}
export async function DELETE(_request: NextRequest, ctx: Context) {
  const { id } = await ctx.params;
  if (!(await getOrganization(id))) return notFound();

  try {
    await deleteOrganization(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, "Could not delete the organization");
  }
}
