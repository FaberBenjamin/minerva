import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Toast, ToastType } from '../types';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Automatikus eltűnés 5 másodperc után
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

interface ToastComponentProps extends Toast {
  onClose: () => void;
}

const ToastComponent = ({ id, message, type, onClose }: ToastComponentProps) => {
  const bgColors: Record<ToastType, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
  };

  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div
      className={`${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 min-w-[300px] animate-slide-in`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold">{icons[type]}</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 transition-colors font-bold text-lg"
      >
        ×
      </button>
    </div>
  );
};
