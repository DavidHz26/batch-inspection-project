import Link from "next/link";
import type { Organization } from "@/lib/types";

export function OrganizationForm({
  action,
  organization,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  organization?: Organization;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-3 max-w-sm">
      <label className="grid gap-1">
        Name
        <input name="name" defaultValue={organization?.name} required />
      </label>
      <label className="grid gap-1">
        Slug
        <input
          name="slug"
          defaultValue={organization?.slug}
          placeholder="Generated from the name if left blank"
          className="font-mono text-sm"
        />
      </label>
      <div className="flex gap-3 items-center">
        <button type="submit">{submitLabel}</button>
        <Link href="/organizations" className="text-sm underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
