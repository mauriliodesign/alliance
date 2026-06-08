import { createContext, useCallback, useContext, useState } from "react";
import { HiX } from "react-icons/hi";

const ToastContext = createContext(null);

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = (id) => setToasts((list) => list.filter((t) => t.id !== id));

  const showToast = ({ message, actionLabel, onAction, duration = 5000 }) => {
    const id = ++counter;
    setToasts((list) => [...list, { id, message, actionLabel, onAction }]);
    if (duration) setTimeout(() => dismiss(id), duration);
    return id;
  };

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-4 rounded-full border border-white/10 bg-alliance-gray px-5 py-3 shadow-2xl"
            style={{ animation: "fadeInUp 0.25s ease both" }}
          >
            <span className="text-sm text-alliance-light">{toast.message}</span>
            {toast.actionLabel && (
              <button
                onClick={() => {
                  toast.onAction?.();
                  dismiss(toast.id);
                }}
                className="text-sm font-semibold text-alliance-yellow transition-opacity hover:opacity-80"
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Close"
              className="text-alliance-light/40 transition-colors hover:text-alliance-light"
            >
              <HiX className="text-sm" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
