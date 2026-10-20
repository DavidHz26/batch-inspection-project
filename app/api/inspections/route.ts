import { parseInspection } from "@/lib/validation";
import { handleApiError, noOrganization, readJson } from "@/app/api/utils";
import { getCurrentOrganizationId } from "@/lib/organization";
import { getInspections, insertInspection } from "@/lib/inspections";

// GET /api/inspections
export async function GET() {
  const organization_id = await getCurrentOrganizationId();
  if(!organization_id) return noOrganization();

  return Response.json(await getInspections());
}

// POST /api/inspections
export async function POST(request: Request) {
  if (!(await getCurrentOrganizationId())) return noOrganization();

  try {
    const input = parseInspection(await readJson(request));
    return Response.json(await insertInspection(input), { status: 201 });
  } catch (error) {
    return handleApiError(error, "Could not create the inspection");
  }
}
