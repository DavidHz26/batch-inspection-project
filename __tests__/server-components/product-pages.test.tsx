import { screen } from "@testing-library/react";
import NewProductPage from "@/app/products/new/page";
import EditProductPage from "@/app/products/[id]/edit/page";
import { renderServerComponent } from "../helpers/server-component";
import { product } from "../helpers/fixtures";

jest.mock("next/navigation", () => ({
  usePathname: () => "/products",
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

jest.mock("@/app/products/actions", () => ({
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

jest.mock("@/lib/organization", () => ({
  getCurrentOrganizationId: jest.fn(),
}));

jest.mock("@/lib/products", () => ({
  getProduct: jest.fn(),
}));

import { getCurrentOrganizationId } from "@/lib/organization";
import { getProduct } from "@/lib/products";

function editParams(id: string) {
  return { params: Promise.resolve({ id }), searchParams: Promise.resolve({}) };
}

describe("product pages (server components)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("NewProductPage", () => {
    it("asks for an organization before creating products", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);

      await renderServerComponent(NewProductPage());

      expect(
        screen.getByText("Select an organization to create products."),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Create" })).not.toBeInTheDocument();
    });

    it("renders an empty product form for the active organization", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");

      await renderServerComponent(NewProductPage());

      expect(screen.getByRole("heading", { name: "New Product" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    });
  });

  describe("EditProductPage", () => {
    it("loads the product scoped to the active organization", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
      (getProduct as jest.Mock).mockResolvedValue(product);

      await renderServerComponent(EditProductPage(editParams("prod-1")));

      expect(getProduct).toHaveBeenCalledWith("org-1", "prod-1");
      expect(screen.getByRole("heading", { name: "Edit Widget" })).toBeInTheDocument();
      expect(screen.getByText(/SKU P001 · active/)).toBeInTheDocument();
      expect(screen.getByDisplayValue("Widget")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });

    it("labels inactive products", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
      (getProduct as jest.Mock).mockResolvedValue({ ...product, is_active: false });

      await renderServerComponent(EditProductPage(editParams("prod-1")));

      expect(screen.getByText(/SKU P001 · inactive/)).toBeInTheDocument();
    });

    it("returns 404 without querying when there is no active organization", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue(null);

      await expect(
        renderServerComponent(EditProductPage(editParams("prod-1"))),
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(getProduct).not.toHaveBeenCalled();
    });

    it("returns 404 when the product does not belong to the organization", async () => {
      (getCurrentOrganizationId as jest.Mock).mockResolvedValue("org-1");
      (getProduct as jest.Mock).mockResolvedValue(null);

      await expect(
        renderServerComponent(EditProductPage(editParams("other"))),
      ).rejects.toThrow("NEXT_NOT_FOUND");
    });
  });
});
