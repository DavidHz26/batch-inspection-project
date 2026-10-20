import type { NextRequest } from "next/server";

export function routeContext(id: string) {
  return { params: Promise.resolve({ id }) } as unknown as {
    params: Promise<{ id: string }>;
  };
}

export function jsonRequest(
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
  url = "http://localhost",
): NextRequest {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new Request(url, init) as unknown as NextRequest;
}

export const emptyRequest = new Request("http://localhost") as unknown as NextRequest;
