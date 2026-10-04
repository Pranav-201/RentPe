import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  title: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const getDefaultTitle = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return 'Success';
    case 'error':
      return 'Notice';
    case 'warning':
      return 'Reminder';
    case 'info':
    default:
      return 'Reminder';
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentToastRef = useRef<{ message: string; type: ToastType } | null>(null);

  const hideToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    currentToastRef.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const cleanMessage = message ? message.trim() : '';
    if (!cleanMessage) return;

    // Deduplication: If identical notification is already showing, do not repeat/stack it
    if (
      currentToastRef.current &&
      currentToastRef.current.message === cleanMessage &&
      currentToastRef.current.type === type
    ) {
      // Refresh auto-dismiss timer so user still has time to read it
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = setTimeout(() => {
        hideToast();
      }, 4000);
      return;
    }

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    const resolvedTitle = title || getDefaultTitle(type);

    currentToastRef.current = { message: cleanMessage, type };
    setToast({
      id: Date.now(),
      message: cleanMessage,
      type,
      title: resolvedTitle,
    });

    toastTimerRef.current = setTimeout(() => {
      hideToast();
    }, 4000);
  }, [hideToast]);

  const success = (message: string, title?: string) => showToast(message, 'success', title);
  const error = (message: string, title?: string) => showToast(message, 'error', title);
  const warning = (message: string, title?: string) => showToast(message, 'warning', title);
  const info = (message: string, title?: string) => showToast(message, 'info', title);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, hideToast }}>
      {children}

      {toast && (
        <div
          key={toast.id}
          role="alert"
          className="fixed left-1/2 top-5 z-[9999] -translate-x-1/2 flex items-center justify-between gap-4 sm:gap-6 min-w-[300px] sm:min-w-[360px] max-w-[92vw] sm:max-w-md px-5 py-3.5 rounded-[26px] bg-[#212227]/95 border border-white/15 text-white shadow-[0_16px_36px_-6px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-250 select-none"
        >
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[13px] sm:text-sm font-semibold text-white tracking-tight leading-snug">
              {toast.title}
            </span>
            <span className="text-xs text-zinc-300 font-normal leading-snug mt-0.5 break-words">
              {toast.message}
            </span>
          </div>

          <button
            type="button"
            onClick={hideToast}
            className="flex-shrink-0 px-4 py-1.5 sm:py-2 rounded-full bg-[#007aff] hover:bg-[#0a84ff] active:scale-95 text-white text-xs font-semibold shadow-[0_4px_14px_rgba(0,122,255,0.35)] transition-all cursor-pointer flex items-center justify-center"
            aria-label="Dismiss notification"
          >
            Got it!
          </button>
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


