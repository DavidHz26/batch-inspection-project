import { ValidationError } from "@/lib/validation";

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("The request body must be a JSON object");
  }
  return body;
}

export function handleApiError(error: unknown, message: string): Response {
  if (error instanceof ValidationError) {
    return Response.json({ error: error.message }, { status: 400 });
  }
  console.error(`[api] ${message}: ${(error as Error).message}`);
  return Response.json({ error: message }, { status: 500 });
}

export function noOrganization(): Response {
  return Response.json(
    { error: "No organization available" },
    { status: 400 },
  );
}
