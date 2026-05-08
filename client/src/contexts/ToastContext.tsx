import { useMemo, useState, type ReactNode } from 'react';
import { ToastContext, type ToastItem, type ToastType } from './toast-context';

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setToasts((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-6 right-6 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm rounded-2xl px-5 py-4 text-sm font-medium text-white shadow-2xl ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};