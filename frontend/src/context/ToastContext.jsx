import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const showError = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const showInfo = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showInfo }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-white dark:bg-[#14201e] text-[#01140F] dark:text-[#f0f6f4] border-[#6B8B78] ring-1 ring-[#6B8B78]/30'
                : toast.type === 'error'
                ? 'bg-white dark:bg-[#14201e] text-[#01140F] dark:text-[#f0f6f4] border-[#83727E] ring-1 ring-[#83727E]/30'
                : 'bg-white dark:bg-[#14201e] text-[#01140F] dark:text-[#f0f6f4] border-[#36586A] dark:border-[#50829C] ring-1 ring-[#36586A]/30'
            }`}
          >
            <span className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#6B8B78] dark:text-[#81ac90]" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#83727E] dark:text-[#b89fae]" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-[#36586A] dark:text-[#50829C]" />}
            </span>
            <p className="text-xs font-semibold flex-1 break-words leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#A3B0AF] dark:text-[#6c8280] hover:text-[#01140F] dark:hover:text-[#f0f6f4] p-0.5 rounded transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
