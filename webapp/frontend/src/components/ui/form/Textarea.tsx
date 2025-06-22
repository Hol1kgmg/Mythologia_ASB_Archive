import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { forwardRef, useId } from 'react';
import { Box } from '../layout/Box';

const textareaVariants = cva(
  'w-full rounded-lg border bg-zinc-700 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default: 'border-zinc-500 focus:border-zinc-400 focus:ring-zinc-400',
        error: 'border-red-600 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-600 focus:border-green-500 focus:ring-green-500',
      },
      size: {
        sm: 'min-h-[80px] px-2 text-xs',
        md: 'min-h-[120px] px-3 text-sm',
        lg: 'min-h-[160px] px-4 text-base',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      resize: 'vertical',
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, resize, label, error, helperText, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;
    const errorVariant = error ? 'error' : variant;

    return (
      <Box className="w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-1 block text-sm font-medium text-zinc-200">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaVariants({ variant: errorVariant, size, resize, className })}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1 text-xs text-red-400">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1 text-xs text-zinc-300">
            {helperText}
          </p>
        )}
      </Box>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
