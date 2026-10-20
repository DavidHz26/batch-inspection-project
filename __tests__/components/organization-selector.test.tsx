import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrganizationSelector } from "@/app/organization-selector";
import { org } from "../helpers/fixtures";

const selectOrganization = jest.fn();

jest.mock("@/app/organizations/actions", () => ({
  selectOrganization: (...args: unknown[]) => selectOrganization(...args),
}));

describe("OrganizationSelector", () => {
  it("shows an empty message when there are no organizations", () => {
    render(<OrganizationSelector organizations={[]} current_id={null} />);
    expect(screen.getByText("No organizations registered.")).toBeInTheDocument();
  });

  it("submits the form when the selected organization changes", async () => {
    const other = { ...org, id: "org-2", name: "Beta", slug: "beta" };
    render(
      <OrganizationSelector organizations={[org, other]} current_id="org-1" />,
    );

    const select = screen.getByLabelText("Organización");
    expect(select).toHaveValue("org-1");
    await userEvent.selectOptions(select, "org-2");
    expect(selectOrganization).toHaveBeenCalled();
  });
});
