import Link from "next/link";
import type { FormAction } from "@/lib/action-state";
import { ActionForm } from "@/app/action-form";
import type { Inspection, Product } from "@/lib/types";
import { ConfirmSubmitButton } from "@/app/confirm-submit-button";

export function InspectionForm({
  action,
  products,
  inspection,
  submit_label,
  confirm_message,
  confirm_submessage,
  confirm_class_name,
}: {
  action: FormAction;
  products: Product[];
  inspection?: Inspection;
  submit_label: string;
  confirm_message: string;
  confirm_submessage?: string;
  confirm_class_name?: string;
}) {
  return (
    <ActionForm action={action} className="grid gap-4 max-w-lg">

      <label className="grid gap-1">
        <span className="font-medium text-sm">Product *</span>
        <select
          name="product_id"
          defaultValue={inspection?.product_id ?? ""}
          required className="border p-2 rounded bg-background">
          <option value="">Selecciona un producto...</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.sku} - {product.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1">
        <span className="font-medium text-sm">Batch *</span>
        <input
          name="batch_number"
          type="text"
          defaultValue={inspection?.batch_number}
          required
          placeholder="Ex. B-2026-001"
          className="border p-2 rounded"
        />
      </label>

      <label className="grid gap-1">
        <span className="font-medium text-sm">Inspection Date *</span>
        <input
          name="inspection_date"
          type="date"
          required
          defaultValue={
            inspection?.inspection_date ?? new Date().toISOString().split("T")[0]
          }
          className="border p-2 rounded"
        />
      </label>

      <label className="grid gap-1">
        <span className="font-medium text-sm">Inspected Units *</span>
        <input
          name="units_inspected"
          type="number"
          defaultValue={inspection?.units_inspected}
          min="1"
          step="1"
          required
          placeholder="Ex. 100"
          className="border p-2 rounded"
        />
      </label>

      <label className="grid gap-1">
        <span className="font-medium text-sm">Defective Units *</span>
        <input
          name="units_defective"
          type="number"
          defaultValue={inspection?.units_defective}
          min="0"
          step="1"
          required
          placeholder="Ex. 2"
          className="border p-2 rounded"
        />
      </label>

      <label className="grid gap-1">
        <span className="font-medium text-sm">Inspector (Optional)</span>
        <input
          name="inspector_name"
          type="text"
          defaultValue={inspection?.inspector_name ?? ""}
          placeholder="Ex. David Hernandez"
          className="border p-2 rounded"
        />
      </label>

      <label className="grid gap-1">
        <span className="font-medium text-sm">Observations (Optional)</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={inspection?.notes ?? ""}
          placeholder="Aditional comments..."
          className="border p-2 rounded"
        />
      </label>

      <div className="flex gap-3 items-center pt-2">
        <ConfirmSubmitButton
          message={confirm_message}
          submessage={confirm_submessage}
          class_name="bg-primary text-primary-foreground px-4 py-2 rounded font-medium hover:opacity-90"
          confirm_class_name={confirm_class_name}
        >
          {submit_label}
        </ConfirmSubmitButton>
        <Link href="/inspections" className="text-sm underline text-muted-foreground">
          Cancel
        </Link>
      </div>
    </ActionForm>
  );
}
