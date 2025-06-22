'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]',
  {
    variants: {
      size: {
        xs: 'h-3 w-3 border-2',
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-[3px]',
        xl: 'h-12 w-12 border-4',
      },
      variant: {
        default: 'text-blue-500',
        primary: 'text-blue-500',
        secondary: 'text-gray-500',
        success: 'text-green-500',
        warning: 'text-yellow-500',
        error: 'text-red-500',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={spinnerVariants({ size, variant, className })}
        role="status"
        aria-label={label || 'Loading'}
        {...props}
      >
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// Dots Spinner Component
export interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';
  className?: string;
  label?: string;
}

export const DotsSpinner: React.FC<DotsSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  label,
}) => {
  const sizeMap = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colorMap = {
    default: 'bg-blue-500',
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    white: 'bg-white',
  };

  return (
    <div
      className={`inline-flex space-x-1 ${className || ''}`}
      role="status"
      aria-label={label || 'Loading'}
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizeMap[size]} ${colorMap[variant]} rounded-full animate-bounce`}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
};

// Pulse Spinner Component
export interface PulseSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';
  className?: string;
  label?: string;
}

export const PulseSpinner: React.FC<PulseSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  label,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const colorMap = {
    default: 'border-blue-500',
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500',
    white: 'border-white',
  };

  return (
    <div className={`inline-flex ${className || ''}`} role="status" aria-label={label || 'Loading'}>
      <div
        className={`${sizeMap[size]} rounded-full border-4 ${colorMap[variant]} border-opacity-20 relative`}
      >
        <div
          className={`${sizeMap[size]} rounded-full border-4 ${colorMap[variant]} border-t-transparent animate-spin absolute inset-0`}
        />
        <div
          className={`${sizeMap[size]} rounded-full border-4 ${colorMap[variant]} border-opacity-40 border-b-transparent animate-pulse absolute inset-0`}
        />
      </div>
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
};

// Loading Overlay Component
export interface LoadingOverlayProps {
  visible?: boolean;
  spinner?: 'default' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'white';
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = true,
  spinner = 'default',
  size = 'lg',
  variant = 'white',
  message,
  className,
  children,
}) => {
  if (!visible) {
    return <>{children}</>;
  }

  const renderSpinner = () => {
    switch (spinner) {
      case 'dots':
        return <DotsSpinner size={size} variant={variant} />;
      case 'pulse':
        return <PulseSpinner size={size} variant={variant} />;
      default:
        return <Spinner size={size} variant={variant} />;
    }
  };

  return (
    <div className={`relative ${className || ''}`}>
      {children}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-3">
          {renderSpinner()}
          {message && <p className="text-white text-sm font-medium">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export { Spinner, spinnerVariants };
