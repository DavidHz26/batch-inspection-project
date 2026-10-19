import type { ReactNode } from "react";

export type AlertVariant = "success" | "error" | "warning" | "info";

const styles: Record<AlertVariant, string> = {
  success: "border-success/50 bg-success/10 text-success",
  error: "border-danger/50 bg-danger/10 text-danger",
  warning: "border-warning/50 bg-warning/10 text-warning",
  info: "border-primary/50 bg-primary/10 text-primary",
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
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[variant]}`}
    >
      <span
        aria-hidden
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold"
      >
        {icons[variant]}
      </span>
      <div className="flex-1 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-foreground">{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="border-0 bg-transparent hover:bg-transparent p-0 rounded-none text-current opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
