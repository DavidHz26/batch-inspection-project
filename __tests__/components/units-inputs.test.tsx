import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UnitsInputs } from "@/app/inspections/units-inputs";

describe("UnitsInputs", () => {
  it("marks defective units invalid when they exceed inspected units", async () => {
    render(
      <form>
        <UnitsInputs />
      </form>,
    );

    const inspected = screen.getByLabelText(/Inspected Units/);
    const defective = screen.getByLabelText(/Defective Units/);

    await userEvent.type(inspected, "10");
    await userEvent.type(defective, "12");

    expect(defective).toBeInvalid();
    expect((defective as HTMLInputElement).validationMessage).toMatch(
      /cannot exceed inspected units \(10\)/,
    );
  });

  it("accepts defective units within the inspected range", async () => {
    render(
      <form>
        <UnitsInputs default_inspected={100} default_defective={2} />
      </form>,
    );

    const defective = screen.getByLabelText(/Defective Units/);
    await userEvent.clear(defective);
    await userEvent.type(defective, "5");
    expect(defective).toBeValid();
  });
});
