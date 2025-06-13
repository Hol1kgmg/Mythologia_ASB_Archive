'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const toastVariants = cva(
  'relative flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm max-w-md',
  {
    variants: {
      variant: {
        info: 'bg-blue-900/80 border-blue-700 text-blue-200',
        success: 'bg-green-900/80 border-green-700 text-green-200',
        warning: 'bg-yellow-900/80 border-yellow-700 text-yellow-200',
        error: 'bg-red-900/80 border-red-700 text-red-200',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
};

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  duration?: number;
  visible?: boolean;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    className, 
    variant, 
    title, 
    closable = true, 
    onClose, 
    icon, 
    children, 
    duration = 5000,
    visible = true,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(visible);
    const Icon = iconMap[variant || 'info'];

    useEffect(() => {
      if (duration > 0 && visible) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, visible, onClose]);

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    if (!isVisible) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={toastVariants({ variant, className })}
        {...props}
      >
        <div className="flex-shrink-0">
          {icon || <Icon className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          {title && (
            <h3 className="font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        {closable && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Close toast"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// Toast Context for managing toasts globally
export interface ToastItem {
  id: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  content: React.ReactNode;
  duration?: number;
  closable?: boolean;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = { ...toast, id };
    
    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          closable={toast.closable}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        >
          {toast.content}
        </Toast>
      ))}
    </div>
  );
};

export { Toast, toastVariants, ToastContainer };