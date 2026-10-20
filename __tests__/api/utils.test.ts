/**
 * @jest-environment node
 */
import { handleApiError, noOrganization, readJson } from "@/app/api/utils";
import { ValidationError } from "@/lib/errors";

describe("readJson", () => {
  it("parses a JSON object", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ name: "Acme" }),
    });
    await expect(readJson(request)).resolves.toEqual({ name: "Acme" });
  });

  it("rejects arrays, primitives, and invalid JSON", async () => {
    await expect(
      readJson(
        new Request("http://localhost", {
          method: "POST",
          body: JSON.stringify(["nope"]),
        }),
      ),
    ).rejects.toThrow(ValidationError);

    await expect(
      readJson(new Request("http://localhost", { method: "POST", body: "not-json" })),
    ).rejects.toThrow(ValidationError);
  });
});

describe("handleApiError", () => {
  it("returns 400 for validation errors", async () => {
    const response = handleApiError(new ValidationError("sku is required"), "failed");
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "sku is required" });
  });

  it("returns 500 for unexpected errors", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const response = handleApiError(new Error("boom"), "Could not save");
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Could not save" });
    error.mockRestore();
  });
});

describe("noOrganization", () => {
  it("returns a 400 payload", async () => {
    const response = noOrganization();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "No organization available",
    });
  });
});
