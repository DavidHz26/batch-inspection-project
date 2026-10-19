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
    <ActionForm action={action} className="grid gap-4 w-full">
      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        Name
        <input 
          name="name" 
          defaultValue={organization?.name} 
          required 
          className="w-full text-sm p-2"
        />
      </label>
      
      <label className="grid gap-1.5 text-sm font-medium text-foreground">
        Slug
        <input
          name="slug"
          defaultValue={organization?.slug}
          placeholder="Generated from the name if left blank"
          className="w-full font-mono text-sm p-2"
        />
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link 
          href="/organizations" 
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
