import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClickableRow } from "@/app/clickable-row";

const push = jest.fn();
const prefetch = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, prefetch }),
}));

describe("ClickableRow", () => {
  beforeEach(() => {
    push.mockReset();
    prefetch.mockReset();
    window.open = jest.fn();
  });

  it("navigates on click and Enter", async () => {
    render(
      <table>
        <tbody>
          <ClickableRow href="/products/1/edit" label="Edit Widget">
            <td>Widget</td>
          </ClickableRow>
        </tbody>
      </table>,
    );

    const row = screen.getByRole("link", { name: "Edit Widget" });
    await userEvent.click(row);
    expect(push).toHaveBeenCalledWith("/products/1/edit");

    row.focus();
    await userEvent.keyboard("{Enter}");
    expect(push).toHaveBeenCalledTimes(2);
  });

  it("opens a new tab with modifier clicks", async () => {
    render(
      <table>
        <tbody>
          <ClickableRow href="/products/1/edit" label="Edit Widget">
            <td>Widget</td>
          </ClickableRow>
        </tbody>
      </table>,
    );

    fireEvent.click(screen.getByRole("link", { name: "Edit Widget" }), {
      ctrlKey: true,
    });
    expect(window.open).toHaveBeenCalledWith("/products/1/edit", "_blank", "noopener");
    expect(push).not.toHaveBeenCalled();
  });
});
