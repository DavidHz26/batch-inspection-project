import { getOrganizations, insertOrganization } from "@/lib/organization";
import { parseOrganization } from "@/lib/validation";
import { handleApiError, readJson } from "@/app/api/utils";

// GET /api/organizations
export async function GET() {
  return Response.json(await getOrganizations());
}

// POST /api/organizations
export async function POST(request: Request) {
  try {
    const input = parseOrganization(await readJson(request));
    return Response.json(await insertOrganization(input), { status: 201 });
  } catch (error) {
    return handleApiError(error, "Could not create the organization");
  }
}
