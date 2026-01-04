import { writable } from "svelte/store";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  durationMs: number;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

interface ToastValue {
  show: (message: string, type?: ToastType, durationMs?: number) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  dismiss: (id: string) => void;
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([]);

  return {
    subscribe,
    show: (
      message: string,
      type: ToastType = "info",
      durationMs: number = 4000,
    ) => {
      const id = createId();
      const toast: Toast = { id, type, message, durationMs };

      update((toasts) => [...toasts, toast]);

      setTimeout(() => {
        update((toasts) => toasts.filter((t) => t.id !== id));
      }, durationMs);
    },
    success: (message: string, durationMs?: number) => {
      getToastContext().show(message, "success", durationMs);
    },
    error: (message: string, durationMs?: number) => {
      getToastContext().show(message, "error", durationMs);
    },
    info: (message: string, durationMs?: number) => {
      getToastContext().show(message, "info", durationMs);
    },
    dismiss: (id: string) => {
      update((toasts) => toasts.filter((t) => t.id !== id));
    },
  };
}

export const toastStore = createToastStore();

// Convenience function to get the toast API
function getToastContext(): ToastValue {
  return {
    show: toastStore.show.bind(toastStore),
    success: toastStore.success.bind(toastStore),
    error: toastStore.error.bind(toastStore),
    info: toastStore.info.bind(toastStore),
    dismiss: toastStore.dismiss.bind(toastStore),
  };
}

export const toast = getToastContext();
