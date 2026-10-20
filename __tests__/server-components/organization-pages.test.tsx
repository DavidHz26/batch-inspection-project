import { screen } from "@testing-library/react";
import EditOrganizationPage from "@/app/organizations/[id]/edit/page";
import { renderServerComponent } from "../helpers/server-component";
import { org } from "../helpers/fixtures";

jest.mock("next/navigation", () => ({
  usePathname: () => "/organizations",
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
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
import { isDemoDataEnabled } from "@/lib/demo-data";

function editParams(id: string) {
  return { params: Promise.resolve({ id }), searchParams: Promise.resolve({}) };
}

describe("EditOrganizationPage (server component)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the organization details and the delete action", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(org);
    (isDemoDataEnabled as jest.Mock).mockReturnValue(false);

    await renderServerComponent(EditOrganizationPage(editParams("org-1")));

    expect(getOrganization).toHaveBeenCalledWith("org-1");
    expect(screen.getByRole("heading", { name: "Edit Acme" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Acme")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("hides the demo actions when demo data is disabled", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(org);
    (isDemoDataEnabled as jest.Mock).mockReturnValue(false);

    await renderServerComponent(EditOrganizationPage(editParams("org-1")));

    expect(screen.queryByRole("button", { name: "Load" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset" })).not.toBeInTheDocument();
  });

  it("shows the demo actions when demo data is enabled", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(org);
    (isDemoDataEnabled as jest.Mock).mockReturnValue(true);

    await renderServerComponent(EditOrganizationPage(editParams("org-1")));

    expect(screen.getByRole("button", { name: "Load" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("returns 404 when the organization does not exist", async () => {
    (getOrganization as jest.Mock).mockResolvedValue(null);

    await expect(
      renderServerComponent(EditOrganizationPage(editParams("missing"))),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
