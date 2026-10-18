import type { Inspection, Product } from "@/lib/types";

export function InspectionForm({
  action,
  products,
  inspection,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  products: Product[];
  inspection?: Inspection;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-3 max-w-sm">
      <label className="grid gap-1">
        Product
        <select
          name="product_id"
          defaultValue={inspection?.product_id}
          required
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.sku} — {product.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        Batch number
        <input
          name="batch_number"
          defaultValue={inspection?.batch_number}
          required
        />
      </label>
      <label className="grid gap-1">
        Inspection date
        <input
          name="inspection_date"
          type="date"
          defaultValue={inspection?.inspection_date}
          required
        />
      </label>
      <label className="grid gap-1">
        Units inspected
        <input
          name="units_inspected"
          type="number"
          min={1}
          defaultValue={inspection?.units_inspected}
          required
        />
      </label>
      <label className="grid gap-1">
        Units defective
        <input
          name="units_defective"
          type="number"
          min={0}
          defaultValue={inspection?.units_defective}
          required
        />
      </label>
      <label className="grid gap-1">
        Inspector
        <input
          name="inspector_name"
          defaultValue={inspection?.inspector_name ?? ""}
        />
      </label>
      <label className="grid gap-1">
        Notes
        <textarea name="notes" rows={2} defaultValue={inspection?.notes ?? ""} />
      </label>
      <button type="submit">{submitLabel}</button>
    </form>
  );
}
