import React, { forwardRef, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Box } from '../layout/Box';

const inputVariants = cva(
  'w-full rounded-lg border bg-zinc-700 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-zinc-500 focus:border-zinc-400 focus:ring-zinc-400',
        error: 'border-red-600 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-600 focus:border-green-500 focus:ring-green-500',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, helperText, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const errorVariant = error ? 'error' : variant;

    return (
      <Box className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-zinc-200"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputVariants({ variant: errorVariant, size, className })}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-xs text-zinc-300">
            {helperText}
          </p>
        )}
      </Box>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };