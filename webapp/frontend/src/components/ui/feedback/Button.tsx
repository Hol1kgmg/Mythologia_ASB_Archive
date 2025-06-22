import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-zinc-600 text-white hover:bg-zinc-500',
        secondary:
          'bg-zinc-700 text-zinc-300 border border-zinc-500 hover:bg-zinc-600 hover:border-zinc-400',
        ghost: 'text-zinc-300 hover:bg-zinc-700 hover:text-white',
        danger: 'bg-red-900 text-red-100 hover:bg-red-800',
        success: 'bg-green-900 text-green-100 hover:bg-green-800',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      focusRing: {
        true: 'focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800',
        false: '',
      },
    },
    compoundVariants: [
      // Primary variant focus rings
      {
        variant: 'primary',
        focusRing: true,
        className: 'focus:ring-zinc-400',
      },
      {
        variant: 'secondary',
        focusRing: true,
        className: 'focus:ring-zinc-400',
      },
      {
        variant: 'ghost',
        focusRing: true,
        className: 'focus:ring-zinc-400',
      },
      {
        variant: 'danger',
        focusRing: true,
        className: 'focus:ring-red-500',
      },
      {
        variant: 'success',
        focusRing: true,
        className: 'focus:ring-green-500',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      focusRing: true,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, fullWidth, focusRing, leftIcon, rightIcon, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, fullWidth, focusRing, className })}
        {...props}
      >
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
