'use client';

import React, { forwardRef, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Box } from '../layout/Box';

const checkboxVariants = cva(
  'h-4 w-4 rounded border-2 bg-gray-800 text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-600 focus:ring-gray-500 checked:bg-gray-600 checked:border-gray-500',
        primary: 'border-blue-600 focus:ring-blue-500 checked:bg-blue-600 checked:border-blue-500',
        success: 'border-green-600 focus:ring-green-500 checked:bg-green-600 checked:border-green-500',
        error: 'border-red-600 focus:ring-red-500 checked:bg-red-600 checked:border-red-500',
      },
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
  error?: string;
  helperText?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, size, label, description, error, helperText, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || `checkbox-${generatedId}`;
    const errorVariant = error ? 'error' : variant;

    return (
      <Box className="w-full">
        <Box display="flex" className="items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={checkboxVariants({ variant: errorVariant, size, className })}
            aria-invalid={!!error}
            aria-describedby={
              error 
                ? `${checkboxId}-error` 
                : description || helperText 
                ? `${checkboxId}-description` 
                : undefined
            }
            {...props}
          />
          {(label || description) && (
            <Box className="flex-1">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className="block text-sm font-medium text-gray-300 cursor-pointer"
                >
                  {label}
                </label>
              )}
              {description && (
                <p
                  id={`${checkboxId}-description`}
                  className="mt-1 text-xs text-gray-400"
                >
                  {description}
                </p>
              )}
            </Box>
          )}
        </Box>
        {error && (
          <p id={`${checkboxId}-error`} className="mt-1 text-xs text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && !description && (
          <p id={`${checkboxId}-description`} className="mt-1 text-xs text-gray-400">
            {helperText}
          </p>
        )}
      </Box>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };