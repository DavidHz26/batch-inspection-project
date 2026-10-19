import type { ReactNode } from "react";

export type AlertVariant = "success" | "error" | "warning" | "info";

const styles: Record<AlertVariant, string> = {
  success: "border-green-300 bg-green-50 text-green-900",
  error: "border-red-300 bg-red-50 text-red-900",
  warning: "border-yellow-300 bg-yellow-50 text-yellow-900",
  info: "border-blue-300 bg-blue-50 text-blue-900",
};

const icons: Record<AlertVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i",
};

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
}: {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${styles[variant]}`}
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold"
      >
        {icons[variant]}
      </span>
      <div className="flex-1 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div>{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="border-0 bg-transparent p-0 text-current opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
