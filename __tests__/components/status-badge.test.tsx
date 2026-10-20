import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/app/status-badge";

describe("StatusBadge", () => {
  it.each(["Approved", "Observations", "Rejected"] as const)(
    "renders %s",
    (status) => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    },
  );
});
