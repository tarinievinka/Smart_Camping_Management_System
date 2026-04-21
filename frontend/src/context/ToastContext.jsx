import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

let toastIdSeq = 0;

function ToastItem({ toast, onDismiss }) {
  const borderAccent =
    toast.variant === "success"
      ? "border-l-[4px] border-l-emerald-500"
      : toast.variant === "error"
        ? "border-l-[4px] border-l-red-500"
        : "border-l-[4px] border-l-sky-500";

  const Icon =
    toast.variant === "success"
      ? CheckCircle2
      : toast.variant === "error"
        ? AlertCircle
        : Info;

  const iconColor =
    toast.variant === "success"
      ? "text-emerald-600"
      : toast.variant === "error"
        ? "text-red-600"
        : "text-sky-600";

  return (
    <div
      className={`app-snackbar-enter pointer-events-auto flex items-start gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)] ${borderAccent}`}
      role="status"
    >
      <Icon className={`shrink-0 mt-0.5 ${iconColor}`} size={20} aria-hidden strokeWidth={2} />
      <p className="flex-1 leading-relaxed font-medium pr-1 pt-0.5">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-xl p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
        aria-label="Dismiss message"
      >
        <X size={18} strokeWidth={2} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    const t = timersRef.current.get(id);
    if (t) clearTimeout(t);
    timersRef.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const id = ++toastIdSeq;
      const variant = options.variant || "info";
      const duration = options.duration !== undefined ? options.duration : 9000;
      setToasts((prev) => [...prev, { id, message: String(message), variant }]);
      if (duration > 0) {
        const tid = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, tid);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div
        className="fixed bottom-0 left-0 right-0 z-[10000] flex flex-col-reverse items-center gap-3 px-4 pb-6 pt-2 pointer-events-none sm:pb-8"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {toasts.map((t) => (
          <div key={t.id} className="w-full max-w-md">
            <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
