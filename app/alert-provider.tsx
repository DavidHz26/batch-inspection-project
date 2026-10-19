"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  Suspense,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { FLASH_COOKIE, type FlashMessage } from "@/lib/flash";
import { Alert, type AlertVariant } from "./alert";

export interface AlertMessage {
  variant: AlertVariant;
  title?: string;
  message: string;
}

interface Toast extends AlertMessage {
  id: number;
}

const DURATION_MS: Record<AlertVariant, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 8000,
};

function takeFlashMessage(): FlashMessage | null {
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${FLASH_COOKIE}=`));
  if (!entry) return null;

  document.cookie = `${FLASH_COOKIE}=; path=/; max-age=0`;
  try {
    return JSON.parse(decodeURIComponent(entry.slice(FLASH_COOKIE.length + 1)));
  } catch {
    return null;
  }
}

function FlashListener({ notify }: { notify: (alert: AlertMessage) => void }) {
  const pathname = usePathname();
  useEffect(() => {
    const flash = takeFlashMessage();
    if (flash) notify(flash);
  }, [pathname, notify]);
  return null;
}

const AlertContext = createContext<((alert: AlertMessage) => void) | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next_id = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (alert: AlertMessage) => {
      const id = next_id.current++;
      setToasts((current) => [...current, { ...alert, id }]);
      setTimeout(() => dismiss(id), DURATION_MS[alert.variant]);
    },
    [dismiss],
  );

  return (
    <AlertContext.Provider value={notify}>
      {children}

      <Suspense fallback={null}>
        <FlashListener notify={notify} />
      </Suspense>
      <div
        aria-live="polite"
        className="fixed top-4 inset-x-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-full sm:max-w-sm"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="shadow-lg">
            <Alert
              variant={toast.variant}
              title={toast.title}
              onClose={() => dismiss(toast.id)}
            >
              {toast.message}
            </Alert>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const notify = useContext(AlertContext);
  if (!notify) throw new Error("useAlerts must be used inside AlertProvider.");
  return notify;
}
