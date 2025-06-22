import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { forwardRef } from 'react';
import { Box } from './Box';

const cardVariants = cva('rounded-lg border transition-all duration-200', {
  variants: {
    variant: {
      default: 'bg-zinc-700 border-zinc-600',
      elevated: 'bg-zinc-700 border-zinc-600 shadow-lg',
      outlined: 'bg-transparent border-zinc-500',
      filled: 'bg-zinc-600 border-zinc-500',
      gradient: 'bg-gradient-to-br from-zinc-700 to-zinc-800 border-zinc-600',
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
    hover: {
      none: '',
      lift: 'hover:shadow-lg hover:-translate-y-1',
      glow: 'hover:shadow-lg hover:shadow-zinc-400/20',
      border: 'hover:border-zinc-400',
      scale: 'hover:scale-105',
    },
    clickable: {
      true: 'cursor-pointer select-none',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
    hover: 'none',
    clickable: false,
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, clickable, header, footer, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={cardVariants({ variant, padding, hover, clickable, className })}
        {...props}
      >
        {header && (
          <Box className="border-b border-zinc-600 pb-3 mb-4">
            {typeof header === 'string' ? (
              <h3 className="text-lg font-semibold text-zinc-200">{header}</h3>
            ) : (
              header
            )}
          </Box>
        )}

        {children && <Box className="text-zinc-200">{children}</Box>}

        {footer && <Box className="border-t border-zinc-600 pt-3 mt-4">{footer}</Box>}
      </Box>
    );
  }
);

Card.displayName = 'Card';

export { Card, cardVariants };
