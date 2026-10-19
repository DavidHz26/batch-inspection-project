"use client";

import { useState, useRef, type ComponentProps, type ReactNode } from "react";

export function ConfirmSubmitButton({
  message,
  submessage,
  children,
  class_name,
  confirm_class_name = "bg-danger text-danger-foreground hover:opacity-90",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1c1c1e] border border-[#38383a] p-5 sm:p-6 rounded-xl shadow-2xl max-w-sm w-full space-y-4">
            <h3 className="text-base font-medium text-foreground tracking-tight">
              {message}
            </h3>
    
            {submessage && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {submessage}
              </p>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                className="px-3.5 py-1.5 border border-[#38383a] rounded-lg text-sm font-medium bg-[#2c2c2e] text-foreground hover:bg-[#3a3a3c] transition-colors"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${confirm_class_name}`}
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