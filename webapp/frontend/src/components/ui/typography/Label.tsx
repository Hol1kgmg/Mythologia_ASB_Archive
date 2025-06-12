'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const labelVariants = cva(
  'font-medium inline-block transition-colors',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
      },
      variant: {
        default: 'text-gray-300',
        primary: 'text-white',
        secondary: 'text-gray-400',
        muted: 'text-gray-500',
        accent: 'text-blue-400',
        success: 'text-green-400',
        warning: 'text-yellow-400',
        error: 'text-red-400',
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-red-500",
        false: '',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      size: 'sm',
      variant: 'default',
      required: false,
      disabled: false,
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  children?: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    className, 
    size, 
    variant, 
    required,
    disabled,
    children, 
    ...props 
  }, ref) => {
    return (
      <label
        ref={ref}
        className={labelVariants({ 
          size, 
          variant, 
          required,
          disabled,
          className 
        })}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

// Badge Label Component
export interface BadgeLabelProps
  extends Omit<LabelProps, 'variant'> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const badgeVariants = cva(
  'inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-700 text-gray-300',
        primary: 'bg-blue-900/80 text-blue-200',
        secondary: 'bg-gray-800 text-gray-400',
        success: 'bg-green-900/80 text-green-200',
        warning: 'bg-yellow-900/80 text-yellow-200',
        error: 'bg-red-900/80 text-red-200',
        info: 'bg-blue-900/80 text-blue-200',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      rounded: 'md',
    },
  }
);

export const BadgeLabel = React.forwardRef<HTMLLabelElement, BadgeLabelProps>(
  ({ 
    className, 
    variant, 
    rounded,
    children, 
    ...props 
  }, ref) => {
    return (
      <label
        ref={ref}
        className={badgeVariants({ variant, rounded, className })}
        {...props}
      >
        {children}
      </label>
    );
  }
);

BadgeLabel.displayName = 'BadgeLabel';

// Icon Label Component
export interface IconLabelProps extends LabelProps {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  spacing?: 'xs' | 'sm' | 'md';
}

export const IconLabel = React.forwardRef<HTMLLabelElement, IconLabelProps>(
  ({ 
    className, 
    icon,
    iconPosition = 'left',
    spacing = 'sm',
    children, 
    ...props 
  }, ref) => {
    const spacingClass = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
    }[spacing];

    return (
      <Label
        ref={ref}
        className={`inline-flex items-center ${spacingClass} ${className || ''}`}
        {...props}
      >
        {iconPosition === 'left' && icon}
        {children}
        {iconPosition === 'right' && icon}
      </Label>
    );
  }
);

IconLabel.displayName = 'IconLabel';

export { Label, labelVariants, badgeVariants };