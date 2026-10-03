import React, { createContext, useCallback, useContext, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const success = (message: string) => showToast(message, 'success');
  const error = (message: string) => showToast(message, 'error');
  const warning = (message: string) => showToast(message, 'warning');
  const info = (message: string) => showToast(message, 'info');

  const toastStyles: Record<ToastType, string> = {
    success: 'border-emerald-500/40 bg-emerald-950/95 text-emerald-100',
    error: 'border-rose-500/40 bg-rose-950/95 text-rose-100',
    info: 'border-sky-500/40 bg-sky-950/95 text-sky-100',
    warning: 'border-amber-500/40 bg-amber-950/95 text-amber-100',
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
  {children}

 {toast && (
  <div
    role="alert"
    className={`fixed left-1/2 top-4 z-[100] -translate-x-1/2
      flex items-center gap-2
      rounded-half
      border
      bg-black/90
      px-4 py-2.5
      text-sm font-medium
      shadow-lg
      backdrop-blur-md
      ${toastStyles[toast.type]}`}
  >
    <span className="text-base">
      {toast.type === "success" && "✓"}
      {toast.type === "error" && "!"}
      {toast.type === "warning" && "!"}
      {toast.type === "info" && "i"}
    </span>

    <span className="whitespace-nowrap">
      {toast.message}
    </span>
  </div>
)}
</ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};


