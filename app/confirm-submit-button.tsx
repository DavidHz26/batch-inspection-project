"use client";

import type { ComponentProps } from "react";

export function ConfirmSubmitButton({
  message,
  ...props
}: ComponentProps<"button"> & { message: string }) {
  return (
    <button
      type="submit"
      {...props}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    />
  );
}
