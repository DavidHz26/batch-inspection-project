import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert } from "@/app/alert";

describe("Alert", () => {
  it("uses role=alert for errors and role=status otherwise", () => {
    const { rerender } = render(<Alert variant="error" title="Broken" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Broken");

    rerender(<Alert variant="success">Saved</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });

  it("calls onClose from the dismiss button", async () => {
    const onClose = jest.fn();
    render(<Alert onClose={onClose}>Hello</Alert>);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
