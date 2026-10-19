"use client";

import { useState, useRef, type ComponentProps, type ReactNode } from "react";

export function ConfirmSubmitButton({
  message,
  submessage,
  children,
  class_name,
  confirm_class_name = "bg-primary text-primary-foreground",
  ...props
}: ComponentProps<"button"> & {
  message: string;
  submessage?: string;
  children: ReactNode;
  class_name?: string;
  confirm_class_name?: string;
}) {
  const [is_open, setIsOpen] = useState(false);
  const button_ref = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    const form = button_ref.current?.closest("form");
    if (form && !form.reportValidity()) return;
    setIsOpen(true);
  };
  const handleClose = () => setIsOpen(false);

  const handleConfirm = () => {
    setIsOpen(false);
    if (button_ref.current) {
      const form = button_ref.current.closest("form");
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <>
      <button
        ref={button_ref}
        type="button"
        className={class_name}
        onClick={handleOpen}
        {...props}
      >
        {children}
      </button>

      {is_open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background border p-4 sm:p-6 rounded-lg shadow-lg max-w-sm w-full space-y-4">
            <h3 className="text-sm text-muted-foreground">{message}</h3>
    
            {submessage && (
              <p className="text-xs italic text-muted-foreground/80">
                {submessage}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-3.5 py-1.5 border rounded text-sm bg-background text-foreground hover:bg-muted"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`px-3.5 py-1.5 rounded text-sm ${confirm_class_name}`}
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
