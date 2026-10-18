import type { NextRequest } from "next/server";
import { getCurrentOrganizationId } from "@/lib/organization";
import { deleteProduct, getProduct, updateProduct } from "@/lib/products";
import { parseProduct } from "@/lib/validation";
import { handleApiError, noOrganization, readJson } from "@/app/api/utils";

type Context = RouteContext<"/api/products/[id]">;

function notFound() {
  return Response.json({ error: "Product not found" }, { status: 404 });
}

// Devuelve el producto si pertenece a la organización activa, o la respuesta de error.
async function findProduct(ctx: Context) {
  const organizationId = await getCurrentOrganizationId();
  if (!organizationId) return { error: noOrganization() };

  const { id } = await ctx.params;
  const product = await getProduct(organizationId, id);
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
    // En la API, si no se envía is_active se conserva el valor actual.
    const input = parseProduct(await readJson(request), {
      isActiveDefault: product.is_active,
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
