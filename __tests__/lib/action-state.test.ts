import { ValidationError } from "@/lib/errors";

const cookiesSet = jest.fn();
const redirect = jest.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({ set: cookiesSet })),
}));

jest.mock("next/navigation", () => ({
  redirect: (url: string) => redirect(url),
}));

import { runAction } from "@/lib/action-state";
import { FLASH_COOKIE } from "@/lib/flash";

describe("runAction", () => {
  beforeEach(() => {
    cookiesSet.mockReset();
    redirect.mockClear();
  });

  it("returns a success state when no redirect is requested", async () => {
    await expect(
      runAction(async () => undefined, {
        success: "Saved",
        failure: "Failed",
      }),
    ).resolves.toEqual({ status: "success", message: "Saved" });
  });

  it("maps ValidationError to a 400-style action state", async () => {
    await expect(
      runAction(
        async () => {
          throw new ValidationError("name is required");
        },
        { success: "Saved", failure: "Failed" },
      ),
    ).resolves.toEqual({
      status: "error",
      title: "Validation error",
      message: "name is required",
    });
  });

  it("maps unexpected errors to the failure title", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      runAction(
        async () => {
          throw new Error("db down");
        },
        { success: "Saved", failure: "Could not save" },
      ),
    ).resolves.toEqual({
      status: "error",
      title: "Could not save",
      message: "db down",
    });
    error.mockRestore();
  });

  it("stores a flash cookie and redirects on success", async () => {
    await expect(
      runAction(async () => undefined, {
        success: "Created",
        failure: "Failed",
        redirect_to: "/organizations",
      }),
    ).rejects.toThrow("REDIRECT:/organizations");

    expect(cookiesSet).toHaveBeenCalledWith(
      FLASH_COOKIE,
      JSON.stringify({ variant: "success", message: "Created" }),
      expect.objectContaining({ path: "/", sameSite: "lax" }),
    );
    expect(redirect).toHaveBeenCalledWith("/organizations");
  });
});
