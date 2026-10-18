import { getCurrentOrganizationId } from "@/lib/organization";
import { getProducts } from "@/lib/products";
import { noOrganization } from "../utils";

export async function GET() {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return noOrganization();

  return Response.json(await getProducts(organizationId));
}

// POST /api/products
export async function POST(request: Request) {
  
}
