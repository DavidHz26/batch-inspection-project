import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionForm } from "@/app/action-form";
import { AlertProvider } from "@/app/alert-provider";
import type { ActionState } from "@/lib/action-state";

jest.mock("next/navigation", () => ({
  usePathname: () => "/products",
}));

describe("ActionForm", () => {
  it("notifies errors returned by the action", async () => {
    const action = jest.fn(async (): Promise<ActionState> => ({
      status: "error",
      title: "Validation error",
      message: "sku is required",
    }));

    render(
      <AlertProvider>
        <ActionForm action={action}>
          <button type="submit">Save</button>
        </ActionForm>
      </AlertProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("sku is required")).toBeInTheDocument();
    expect(screen.getByText("Validation error")).toBeInTheDocument();
  });

  it("notifies success returned by the action", async () => {
    const action = jest.fn(async (): Promise<ActionState> => ({
      status: "success",
      message: "Product created successfully.",
    }));

    render(
      <AlertProvider>
        <ActionForm action={action}>
          <button type="submit">Save</button>
        </ActionForm>
      </AlertProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Product created successfully.")).toBeInTheDocument();
  });
});
