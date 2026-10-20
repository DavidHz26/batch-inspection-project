"use client";

import { startTransition, useActionState, useEffect, type ReactNode } from "react";
import type { FormAction } from "@/lib/action-state";
import { useAlerts } from "./alert-provider";

export function ActionForm({
  action,
  className,
  children,
}: {
  action: FormAction;
  className?: string;
  children: ReactNode;
}) {
  const [state, dispatch, pending] = useActionState(action, null);
  const notify = useAlerts();

  useEffect(() => {
    if (!state) return;
    if (state.status === "error") {
      notify({ variant: "error", title: state.title, message: state.message });
    } else {
      notify({ variant: "success", message: state.message });
    }
  }, [state, notify]);

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        const form_data = new FormData(event.currentTarget);
        startTransition(() => dispatch(form_data));
      }}
    >
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
