"use client";

import { useState, type ChangeEvent } from "react";

const INPUT_CLASS = "border p-2 rounded";

function defectiveError(defective: string, inspected: string): string {
  const max = Number(inspected);
  if (defective === "" || !Number.isInteger(max) || max <= 0) return "";
  return Number(defective) > max
    ? `Defective units cannot exceed inspected units (${max}).`
    : "";
}

export function UnitsInputs({
  default_inspected,
  default_defective,
}: {
  default_inspected?: number;
  default_defective?: number;
}) {
  const [units_inspected, setUnitsInspected] = useState(
    default_inspected?.toString() ?? "",
  );

  const syncDefectiveValidity = (form: HTMLFormElement | null, inspected: string) => {
    const defective = form?.elements.namedItem("units_defective");
    if (defective instanceof HTMLInputElement) {
      defective.setCustomValidity(defectiveError(defective.value, inspected));
    }
  };

  const handleInspectedChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUnitsInspected(event.target.value);
    syncDefectiveValidity(event.target.form, event.target.value);
  };

  const handleDefectiveChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.target.setCustomValidity(defectiveError(event.target.value, units_inspected));
  };

  return (
    <>
      <label className="grid gap-1">
        <span className="font-medium text-sm">Inspected Units *</span>
        <input
          name="units_inspected"
          type="number"
          inputMode="numeric"
          value={units_inspected}
          onChange={handleInspectedChange}
          min="1"
          step="1"
          required
          placeholder="Ex. 100"
          className={INPUT_CLASS}
        />
      </label>

      <label className="grid gap-1">
        <span className="font-medium text-sm">Defective Units *</span>
        <input
          name="units_defective"
          type="number"
          inputMode="numeric"
          defaultValue={default_defective}
          onChange={handleDefectiveChange}
          min="0"
          step="1"
          required
          placeholder="Ex. 2"
          className={INPUT_CLASS}
        />
      </label>
    </>
  );
}
