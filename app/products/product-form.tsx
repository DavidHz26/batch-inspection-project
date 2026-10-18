import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  product?: Product;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-3 max-w-sm">
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
        <button type="submit">{submitLabel}</button>
        <Link href="/products" className="text-sm underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
