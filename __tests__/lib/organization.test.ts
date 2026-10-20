import { org } from "../helpers/fixtures";

jest.mock("@/lib/supabase", () => {
  const { createSupabaseMock } = jest.requireActual<
    typeof import("../helpers/supabase-mock")
  >("../helpers/supabase-mock");
  return { supabase: createSupabaseMock() };
});

const cookieGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({ get: cookieGet })),
}));

import { type MockSupabase } from "../helpers/supabase-mock";
import { supabase } from "@/lib/supabase";
import {
  deleteOrganization,
  getCurrentOrganizationId,
  getOrganization,
  getOrganizations,
  getOrganizationsPage,
  insertOrganization,
  requireOrganizationId,
  updateOrganization,
} from "@/lib/organization";

const mock = supabase as unknown as MockSupabase;

describe("organization data layer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mock.result.data = [];
    mock.result.error = null;
    mock.result.count = 0;
    cookieGet.mockReset();
  });

  it("returns organizations or throws on supabase errors", async () => {
    mock.result.data = [org];
    await expect(getOrganizations()).resolves.toEqual([org]);

    mock.result.error = { message: "timeout" };
    await expect(getOrganizations()).rejects.toThrow(
      "Error while trying to get the organizations: timeout",
    );
  });

  it("pages organizations ordered by name with the total count", async () => {
    mock.result.data = [org];
    mock.result.count = 12;
    await expect(getOrganizationsPage(2, 5)).resolves.toEqual({ data: [org], count: 12 });
    expect(mock.builder.order).toHaveBeenCalledWith("name");
    expect(mock.builder.range).toHaveBeenCalledWith(5, 9);
  });

  it("returns an empty page when supabase sends no rows", async () => {
    mock.result.data = null;
    mock.result.count = null;
    await expect(getOrganizationsPage(1, 10)).resolves.toEqual({ data: [], count: 0 });
  });

  it("throws when paging organizations fails", async () => {
    mock.result.error = { message: "timeout" };
    await expect(getOrganizationsPage(1, 10)).rejects.toThrow(
      "Error while trying to get the organizations: timeout",
    );
  });

  it("returns a single organization or null", async () => {
    mock.result.data = org;
    await expect(getOrganization("org-1")).resolves.toEqual(org);
    expect(mock.builder.eq).toHaveBeenCalledWith("id", "org-1");

    mock.result.data = null;
    await expect(getOrganization("missing")).resolves.toBeNull();
  });

  it("throws when loading a single organization fails", async () => {
    mock.result.error = { message: "timeout" };
    await expect(getOrganization("org-1")).rejects.toThrow(
      "Error while trying to get the organization: timeout",
    );
  });

  it("prefers the cookie when it matches an organization", async () => {
    mock.result.data = [org, { ...org, id: "org-2", slug: "other" }];
    cookieGet.mockReturnValue({ value: "org-2" });
    await expect(getCurrentOrganizationId()).resolves.toBe("org-2");
  });

  it("falls back to the first organization when the cookie is missing", async () => {
    mock.result.data = [org];
    cookieGet.mockReturnValue(undefined);
    await expect(getCurrentOrganizationId()).resolves.toBe("org-1");
  });

  it("ignores a cookie that points to an organization that no longer exists", async () => {
    mock.result.data = [org];
    cookieGet.mockReturnValue({ value: "deleted-org" });
    await expect(getCurrentOrganizationId()).resolves.toBe("org-1");
  });

  it("returns null when there are no organizations", async () => {
    mock.result.data = [];
    await expect(getCurrentOrganizationId()).resolves.toBeNull();
    await expect(requireOrganizationId()).rejects.toThrow(
      "Select an organization to proceed",
    );
  });

  it("requires the current organization id", async () => {
    mock.result.data = [org];
    await expect(requireOrganizationId()).resolves.toBe("org-1");
  });

  it("inserts an organization and derives a slug when needed", async () => {
    mock.result.data = org;
    await expect(insertOrganization({ name: "Acme", slug: "" })).resolves.toEqual(org);
    expect(mock.builder.insert).toHaveBeenCalledWith({
      name: "Acme",
      slug: "acme",
    });
  });

  it("keeps the given slug and wraps insert errors", async () => {
    mock.result.error = { message: "duplicate key" };
    await expect(
      insertOrganization({ name: "Acme Labs", slug: "acme" }),
    ).rejects.toThrow("Could not create organization: duplicate key");
    expect(mock.builder.insert).toHaveBeenCalledWith({ name: "Acme Labs", slug: "acme" });
  });

  it("updates an organization by id and derives the slug from a new name", async () => {
    mock.result.data = { ...org, name: "Acme Labs" };
    await expect(updateOrganization("org-1", { name: "Acme Labs" })).resolves.toEqual({
      ...org,
      name: "Acme Labs",
    });
    expect(mock.builder.update).toHaveBeenCalledWith({ name: "Acme Labs", slug: "acme-labs" });
    expect(mock.builder.eq).toHaveBeenCalledWith("id", "org-1");
  });

  it("keeps an explicit slug on update", async () => {
    mock.result.data = org;
    await updateOrganization("org-1", { name: "Acme Labs", slug: "acme" });
    expect(mock.builder.update).toHaveBeenCalledWith({ name: "Acme Labs", slug: "acme" });
  });

  it("only changes the slug when that is the only field sent", async () => {
    mock.result.data = org;
    await updateOrganization("org-1", { slug: "new-slug" });
    expect(mock.builder.update).toHaveBeenCalledWith({ slug: "new-slug" });
  });

  it("wraps update errors", async () => {
    mock.result.error = { message: "duplicate key" };
    await expect(updateOrganization("org-1", { name: "Acme" })).rejects.toThrow(
      "Could not update organization: duplicate key",
    );
  });

  it("deletes an organization by id", async () => {
    await expect(deleteOrganization("org-1")).resolves.toBeUndefined();
    expect(mock.builder.delete).toHaveBeenCalled();
    expect(mock.builder.eq).toHaveBeenCalledWith("id", "org-1");
  });

  it("wraps delete errors", async () => {
    mock.result.error = { message: "fk" };
    await expect(deleteOrganization("org-1")).rejects.toThrow(
      "Could not delete organization: fk",
    );
  });
});
