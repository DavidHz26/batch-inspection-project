import type { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { OrganizationForm } from "@/app/organizations/organization-form";
import { ProductForm } from "@/app/products/product-form";
import { InspectionForm } from "@/app/inspections/inspection-form";
import { AlertProvider } from "@/app/alert-provider";
import { org, product, inspection } from "../helpers/fixtures";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const action = jest.fn(async () => null);

function renderForm(ui: ReactElement) {
  return render(<AlertProvider>{ui}</AlertProvider>);
}

describe("entity forms", () => {
  it("prefills the organization form", () => {
    renderForm(
      <OrganizationForm
        action={action}
        organization={org}
        submit_label="Save"
        confirm_message="Save org?"
      />,
    );
    expect(screen.getByDisplayValue("Acme")).toBeInTheDocument();
    expect(screen.getByDisplayValue("acme")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/organizations",
    );
  });

  it("prefills the product form including the active checkbox", () => {
    renderForm(
      <ProductForm
        action={action}
        product={product}
        submit_label="Save"
        confirm_message="Save product?"
      />,
    );
    expect(screen.getByDisplayValue("P001")).toBeInTheDocument();
    expect(screen.getByLabelText("Active")).toBeChecked();
  });

  it("lists products and inspection fields", () => {
    renderForm(
      <InspectionForm
        action={action}
        products={[product]}
        inspection={inspection}
        submit_label="Save"
        confirm_message="Save inspection?"
      />,
    );
    expect(screen.getByDisplayValue("P001 - Widget")).toBeInTheDocument();
    expect(screen.getByDisplayValue("B-001")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-03-01")).toBeInTheDocument();
    expect(screen.getByDisplayValue("100")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2")).toBeInTheDocument();
  });
});
