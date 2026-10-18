import { getCurrentOrganizationId } from "@/lib/organization";
import { getProducts, insertProduct } from "@/lib/products";
import { parseProduct } from "@/lib/validation";
import { handleApiError, noOrganization, readJson } from "@/app/api/utils";

// GET /api/products
export async function GET() {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return noOrganization();

  return Response.json(await getProducts(organizationId));
}

// POST /api/products
export async function POST(request: Request) {
  if (!(await getCurrentOrganizationId())) return noOrganization();

  try {
    const input = parseProduct(await readJson(request));
    return Response.json(await insertProduct(input), { status: 201 });
  } catch (error) {
    return handleApiError(error, "Could not create the product");
  }
}
