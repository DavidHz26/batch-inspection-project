import {
  formValues,
  parseInspection,
  parseOrganization,
  parseProduct,
  slugify,
} from "@/lib/validation";

describe("slugify", () => {
  it("normalizes accents, case, and punctuation", () => {
    expect(slugify("  Café México!! ")).toBe("cafe-mexico");
  });
});

describe("formValues", () => {
  it("converts FormData into a plain object", () => {
    const data = new FormData();
    data.set("name", "Acme");
    expect(formValues(data)).toEqual({ name: "Acme" });
  });
});

describe("parseOrganization", () => {
  it("requires a name and slugifies a missing slug from the name", () => {
    expect(parseOrganization({ name: "Acme Corp" })).toEqual({
      name: "Acme Corp",
      slug: "acme-corp",
    });
  });

  it("keeps an explicit slug", () => {
    expect(parseOrganization({ name: "Acme", slug: "custom-slug" }).slug).toBe(
      "custom-slug",
    );
  });

  it("rejects non-text name in organization", () => {
    expect(() => parseOrganization({ name: 123 as unknown as string })).toThrow("name must be text");
  });
});

describe("parseProduct", () => {
  it("parses required fields and checkbox-style is_active", () => {
    expect(parseProduct({ sku: "P001", name: "Widget", is_active: "on" })).toEqual({
      sku: "P001",
      name: "Widget",
      is_active: true,
    });
  });

  it("treats explicit non-true is_active as false", () => {
    expect(parseProduct({ sku: "P001", name: "Widget", is_active: "off" }).is_active).toBe(false);
  });

  it("uses the default when is_active is omitted", () => {
    expect(parseProduct({ sku: "P001", name: "Widget" }).is_active).toBe(true);
    expect(
      parseProduct({ sku: "P001", name: "Widget" }, { is_active_default: false })
        .is_active,
    ).toBe(false);
  });
});

describe("parseInspection", () => {
  const valid = {
    product_id: "prod-1",
    batch_number: "B-001",
    inspection_date: "2026-03-01",
    units_inspected: "100",
    units_defective: "2",
    inspector_name: " David ",
    notes: " ok ",
  };

  it("classifies units and trims optional text", () => {
    expect(parseInspection(valid)).toMatchObject({
      product_id: "prod-1",
      batch_number: "B-001",
      inspection_date: "2026-03-01",
      units_inspected: 100,
      units_defective: 2,
      defect_percentage: 2,
      status: "Approved",
      inspector_name: "David",
      notes: "ok",
    });
  });

  it("rejects non-matching date formats", () => {
    expect(() =>
      parseInspection({ ...valid, inspection_date: "invalid-date" }),
    ).toThrow("inspection_date must be a valid date (YYYY-MM-DD)");
  });

  it("rejects invalid calendar dates", () => {
    expect(() =>
      parseInspection({ ...valid, inspection_date: "2026-02-31" }),
    ).toThrow(/valid date/);
  });

  it("accepts ISO datetime values and keeps the original string", () => {
    const value = "2026-03-01T12:00:00Z";
    expect(parseInspection({ ...valid, inspection_date: value }).inspection_date).toBe(
      value,
    );
  });
});
