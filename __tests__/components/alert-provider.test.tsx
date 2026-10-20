import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertProvider, useAlerts } from "@/app/alert-provider";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

function Trigger() {
  const notify = useAlerts();
  return (
    <button type="button" onClick={() => notify({ variant: "success", message: "Saved" })}>
      Notify
    </button>
  );
}

describe("AlertProvider", () => {
  it("shows flash messages stored in the cookie", async () => {
    document.cookie = `flash=${encodeURIComponent(JSON.stringify({ variant: "success", message: "Created" }))}`;
    render(
      <AlertProvider>
        <div>child</div>
      </AlertProvider>,
    );
    expect(await screen.findByText("Created")).toBeInTheDocument();
  });

  it("renders toasts from useAlerts", async () => {
    render(
      <AlertProvider>
        <Trigger />
      </AlertProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Notify" }));
    expect(await screen.findByText("Saved")).toBeInTheDocument();
  });
});
