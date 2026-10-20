import Link from "next/link";
import type { FormAction } from "@/lib/action-state";
import { ActionForm } from "@/app/action-form";
import type { Inspection, Product } from "@/lib/types";
import { ConfirmSubmitButton } from "@/app/confirm-submit-button";
import { UnitsInputs } from "./units-inputs";

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
    <ActionForm action={action} className="grid gap-4 w-full">

      <label className="grid gap-1">
        <span className="font-medium text-sm">Product *</span>
        <select
          name="product_id"
          defaultValue={inspection?.product_id ?? ""}
          required className="p-2 w-full">
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
          pattern=".*\S.*"
          title="Batch cannot be empty or only spaces."
          placeholder="Ex. B-2026-001"
          className="p-2 w-full"
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
          className="p-2 w-full"
        />
      </label>

      <UnitsInputs
        default_inspected={inspection?.units_inspected}
        default_defective={inspection?.units_defective}
      />

      <label className="grid gap-1">
        <span className="font-medium text-sm">Inspector (Optional)</span>
        <input
          name="inspector_name"
          type="text"
          defaultValue={inspection?.inspector_name ?? ""}
          placeholder="Ex. David Hernandez"
          className="p-2 w-full"
        />
      </label>

      <label className="grid gap-1">
        <span className="font-medium text-sm">Observations (Optional)</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={inspection?.notes ?? ""}
          placeholder="Aditional comments..."
          className="p-2 w-full"
        />
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link 
          href="/inspections" 
          className="px-4 py-2 border border-[#38383a] rounded-full text-sm font-medium bg-[#2c2c2e] text-foreground hover:bg-[#3a3a3c] transition-colors"
        >
          Cancel
        </Link>
        <ConfirmSubmitButton
          message={confirm_message}
          submessage={confirm_submessage}
          class_name="px-5 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          confirm_class_name={confirm_class_name}
        >
          {submit_label}
        </ConfirmSubmitButton>
      </div>
    </ActionForm>
  );
}