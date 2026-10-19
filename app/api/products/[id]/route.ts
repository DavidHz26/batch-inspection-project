import type { NextRequest } from "next/server";
import { getCurrentOrganizationId } from "@/lib/organization";
import { deleteProduct, getProduct, updateProduct } from "@/lib/products";
import { parseProduct } from "@/lib/validation";
import { handleApiError, noOrganization, readJson } from "@/app/api/utils";

type Context = RouteContext<"/api/products/[id]">;

function notFound() {
  return Response.json({ error: "Product not found" }, { status: 404 });
}

async function findProduct(ctx: Context) {
  const organization_id = await getCurrentOrganizationId();
  if (!organization_id) return { error: noOrganization() };

  const { id } = await ctx.params;
  const product = await getProduct(organization_id, id);
  return product ? { product } : { error: notFound() };
}

// GET /api/products/{id}
export async function GET(_request: NextRequest, ctx: Context) {
  const { product, error } = await findProduct(ctx);
  return error ?? Response.json(product);
}

// PUT /api/products/{id}
export async function PUT(request: NextRequest, ctx: Context) {
  const { product, error } = await findProduct(ctx);
  if (error) return error;

  try {
    const input = parseProduct(await readJson(request), {
      is_active_default: product.is_active,
    });
    return Response.json(await updateProduct(product.id, input));
  } catch (error) {
    return handleApiError(error, "Could not update the product");
  }
}

// DELETE /api/products/{id}
export async function DELETE(_request: NextRequest, ctx: Context) {
  const { product, error } = await findProduct(ctx);
  if (error) return error;

  try {
    await deleteProduct(product.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, "Could not delete the product");
  }
}
