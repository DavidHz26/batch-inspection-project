import { render, screen } from "@testing-library/react";
import { Loading } from "@/app/loading-text";

describe("Loading", () => {
  it("renders a generic loading status", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading...");
  });

  it("includes an optional label", () => {
    render(<Loading label="summary" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading summary...");
  });
});
