'use client';

import React, { forwardRef, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Box } from '../layout/Box';

const radioVariants = cva(
  'h-4 w-4 rounded-full border-2 bg-zinc-700 text-zinc-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-zinc-500 focus:ring-zinc-400 checked:bg-zinc-500 checked:border-zinc-400',
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

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof radioVariants> {
  label?: string;
  description?: string;
  error?: string;
  helperText?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, variant, size, label, description, error, helperText, id, ...props }, ref) => {
    const generatedId = useId();
    const radioId = id || `radio-${generatedId}`;
    const errorVariant = error ? 'error' : variant;

    return (
      <Box className="w-full">
        <Box display="flex" className="items-start gap-3">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className={radioVariants({ variant: errorVariant, size, className })}
            aria-invalid={!!error}
            aria-describedby={
              error 
                ? `${radioId}-error` 
                : description || helperText 
                ? `${radioId}-description` 
                : undefined
            }
            {...props}
          />
          {(label || description) && (
            <Box className="flex-1">
              {label && (
                <label
                  htmlFor={radioId}
                  className="block text-sm font-medium text-zinc-200 cursor-pointer"
                >
                  {label}
                </label>
              )}
              {description && (
                <p
                  id={`${radioId}-description`}
                  className="mt-1 text-xs text-zinc-300"
                >
                  {description}
                </p>
              )}
            </Box>
          )}
        </Box>
        {error && (
          <p id={`${radioId}-error`} className="mt-1 text-xs text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && !description && (
          <p id={`${radioId}-description`} className="mt-1 text-xs text-zinc-300">
            {helperText}
          </p>
        )}
      </Box>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio, radioVariants };