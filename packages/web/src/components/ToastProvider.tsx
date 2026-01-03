"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  durationMs: number;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, durationMs?: number) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "info", durationMs: number = 4000) => {
      const id = createId();
      setToasts((prev) => [...prev, { id, type, message, durationMs }]);
      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message, durationMs) => show(message, "success", durationMs),
      error: (message, durationMs) => show(message, "error", durationMs),
      info: (message, durationMs) => show(message, "info", durationMs),
    }),
    [show],
  );

  useEffect(() => {
    const onSyncFailed = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      const count = detail?.count ?? 1;
      value.error(
        `Some offline actions failed to sync (${count}). We'll retry automatically.`,
      );
    };

    window.addEventListener("pmp-sync-failed", onSyncFailed);
    return () => window.removeEventListener("pmp-sync-failed", onSyncFailed);
  }, [value]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[200] space-y-2"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={`max-w-sm rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${
              t.type === "success"
                ? "bg-green-900/30 border-green-800 text-green-200"
                : t.type === "error"
                  ? "bg-red-900/30 border-red-800 text-red-200"
                  : "bg-gray-900/60 border-gray-700 text-gray-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-snug">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="text-xs text-gray-300 hover:text-white"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
