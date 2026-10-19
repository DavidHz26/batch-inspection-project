import Link from "next/link";
import type { FormAction } from "@/lib/action-state";
import { ActionForm } from "@/app/action-form";
import type { Product } from "@/lib/types";
import { ConfirmSubmitButton } from "@/app/confirm-submit-button";

export function ProductForm({
  action,
  product,
  submit_label,
  confirm_message,
  confirm_submessage,
  confirm_class_name,
}: {
  action: FormAction;
  product?: Product;
  submit_label: string;
  confirm_message: string;
  confirm_submessage?: string;
  confirm_class_name?: string;
}) {
  return (
    <ActionForm action={action} className="grid gap-3 max-w-sm">
      <label className="grid gap-1">
        SKU
        <input
          name="sku"
          defaultValue={product?.sku}
          required
          className="font-mono text-sm"
        />
      </label>
      <label className="grid gap-1">
        Name
        <input name="name" defaultValue={product?.name} required />
      </label>
      <label className="flex gap-2 items-center">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={product?.is_active ?? true}
        />
        Active
      </label>
      <div className="flex gap-3 items-center">
        <ConfirmSubmitButton
          message={confirm_message}
          submessage={confirm_submessage}
          class_name="px-3.5 py-1.5 rounded text-sm bg-primary text-primary-foreground"
          confirm_class_name={confirm_class_name}
        >
          {submit_label}
        </ConfirmSubmitButton>
        <Link href="/products" className="text-sm underline">
          Cancel
        </Link>
      </div>
    </ActionForm>
  );
}
