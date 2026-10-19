import Link from "next/link";
import type { FormAction } from "@/lib/action-state";
import { ActionForm } from "@/app/action-form";
import type { Organization } from "@/lib/types";
import { ConfirmSubmitButton } from "@/app/confirm-submit-button";

export function OrganizationForm({
  action,
  organization,
  submit_label,
  confirm_message,
  confirm_submessage,
  confirm_class_name,
}: {
  action: FormAction;
  organization?: Organization;
  submit_label: string;
  confirm_message: string;
  confirm_submessage?: string;
  confirm_class_name?: string;
}) {
  return (
    <ActionForm action={action} className="grid gap-3 max-w-sm">
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
        <ConfirmSubmitButton
          message={confirm_message}
          submessage={confirm_submessage}
          class_name="px-3.5 py-1.5 rounded text-sm bg-primary text-primary-foreground"
          confirm_class_name={confirm_class_name}
        >
          {submit_label}
        </ConfirmSubmitButton>
        
        <Link href="/organizations" className="text-sm underline">
          Cancel
        </Link>
      </div>
    </ActionForm>
  );
}
