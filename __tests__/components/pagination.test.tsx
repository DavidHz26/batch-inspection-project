import { render, screen } from "@testing-library/react";
import { Pagination, PageSizeForm } from "@/app/pagination";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Pagination", () => {
  it("disables Previous on the first page and links Next", () => {
    render(
      <Pagination
        base_path="/products"
        page={1}
        page_size={10}
        count={25}
        params={{ status: "Approved" }}
      />,
    );
    expect(screen.getByText("Page 1 of 3 (Total: 25 records)")).toBeInTheDocument();
    expect(screen.getByText("Previous").tagName).toBe("SPAN");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/products?status=Approved&page=2&page_size=10",
    );
  });

  it("clamps the current page to the last page", () => {
    render(<Pagination base_path="/products" page={99} page_size={10} count={5} />);
    expect(screen.getByText("Page 1 of 1 (Total: 5 records)")).toBeInTheDocument();
    expect(screen.getByText("Next").tagName).toBe("SPAN");
  });
});

describe("PageSizeForm", () => {
  it("keeps extra query params as hidden fields", () => {
    render(<PageSizeForm page_size={10} params={{ product_id: "prod-1" }} />);
    expect(screen.getByDisplayValue("prod-1")).toHaveAttribute("name", "product_id");
    expect(screen.getByRole("combobox")).toHaveValue("10");
  });
});
