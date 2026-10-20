import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmSubmitButton } from "@/app/confirm-submit-button";

describe("ConfirmSubmitButton", () => {
  it("opens a confirmation dialog and submits the form on confirm", async () => {
    const onSubmit = jest.fn((event: SubmitEvent) => event.preventDefault());

    render(
      <form onSubmit={onSubmit as never}>
        <input name="name" defaultValue="Acme" required />
        <ConfirmSubmitButton message="Save this organization?" submessage="This cannot be undone.">
          Save
        </ConfirmSubmitButton>
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByText("Save this organization?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onSubmit).toHaveBeenCalled();
    expect(screen.queryByText("Save this organization?")).not.toBeInTheDocument();
  });

  it("closes the dialog without submitting", async () => {
    const onSubmit = jest.fn((event: SubmitEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit as never}>
        <ConfirmSubmitButton message="Delete?">Delete</ConfirmSubmitButton>
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Delete?")).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
