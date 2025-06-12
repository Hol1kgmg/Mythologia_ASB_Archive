import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const boxVariants = cva('', {
  variants: {
    padding: {
      none: '',
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
    margin: {
      none: '',
      xs: 'm-2',
      sm: 'm-3',
      md: 'm-4',
      lg: 'm-6',
      xl: 'm-8',
    },
    background: {
      none: '',
      default: 'bg-zinc-700',
      darker: 'bg-zinc-800',
      truedark: 'bg-zinc-900',
      lighter: 'bg-zinc-600',
      transparent: 'bg-transparent',
      gradient: 'bg-gradient-to-b from-zinc-800 to-zinc-900',
    },
    border: {
      none: '',
      default: 'border border-zinc-600',
      thick: 'border-2 border-zinc-600',
      dashed: 'border border-dashed border-zinc-600',
    },
    rounded: {
      none: '',
      sm: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
    shadow: {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    },
    display: {
      block: 'block',
      inline: 'inline-block',
      flex: 'flex',
      inlineFlex: 'inline-flex',
      grid: 'grid',
    },
  },
  defaultVariants: {
    padding: 'none',
    margin: 'none',
    background: 'none',
    border: 'none',
    rounded: 'none',
    shadow: 'none',
    display: 'block',
  },
});

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {
  as?: React.ElementType;
}

const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ className, padding, margin, background, border, rounded, shadow, display, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={boxVariants({
          padding,
          margin,
          background,
          border,
          rounded,
          shadow,
          display,
          className,
        })}
        {...props}
      />
    );
  }
);

Box.displayName = 'Box';

export { Box, boxVariants };