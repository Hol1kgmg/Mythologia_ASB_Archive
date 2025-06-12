'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const alertVariants = cva(
  'relative flex items-start gap-3 p-4 rounded-lg border',
  {
    variants: {
      variant: {
        info: 'bg-blue-900/20 border-blue-800 text-blue-200',
        success: 'bg-green-900/20 border-green-800 text-green-200',
        warning: 'bg-yellow-900/20 border-yellow-800 text-yellow-200',
        error: 'bg-red-900/20 border-red-800 text-red-200',
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

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, closable, onClose, icon, children, ...props }, ref) => {
    const Icon = iconMap[variant || 'info'];
    const showIcon = icon !== null;

    return (
      <div
        ref={ref}
        role="alert"
        className={alertVariants({ variant, className })}
        {...props}
      >
        {showIcon && (
          <div className="flex-shrink-0">
            {icon || <Icon className="h-5 w-5" />}
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h3 className="font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        {closable && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Close alert"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert, alertVariants };