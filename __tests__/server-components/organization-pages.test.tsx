import { screen } from "@testing-library/react";
import EditOrganizationPage from "@/app/organizations/[id]/edit/page";
import { pageParams, renderServerComponent } from "../helpers/server-component";
import { org } from "../helpers/fixtures";

jest.mock("next/navigation", () => ({
  usePathname: () => "/organizations",
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("@/app/organizations/actions", () => ({
  updateOrganization: jest.fn(),
  deleteOrganization: jest.fn(),
  loadDemoData: jest.fn(),
  resetDemoData: jest.fn(),
}));

jest.mock("@/lib/organization", () => ({
  getOrganization: jest.fn(),
}));

jest.mock("@/lib/demo-data", () => ({
  isDemoDataEnabled: jest.fn(),
}));

import { getOrganization } from "@/lib/organization";

describe("EditOrganizationPage (server component)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the organization details and the delete action", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(org);

    await renderServerComponent(EditOrganizationPage(pageParams("org-1")));

    expect(getOrganization).toHaveBeenCalledWith("org-1");
    expect(screen.getByRole("heading", { name: "Edit Acme" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Acme")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("returns 404 when the organization does not exist", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(null);

    await expect(
      renderServerComponent(EditOrganizationPage(pageParams("missing"))),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
