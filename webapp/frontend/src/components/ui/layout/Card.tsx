import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Box } from './Box';

const cardVariants = cva(
  'rounded-lg border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-800 border-gray-700',
        elevated: 'bg-gray-800 border-gray-700 shadow-lg',
        outlined: 'bg-transparent border-gray-600',
        filled: 'bg-gray-700 border-gray-600',
        gradient: 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700',
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
        glow: 'hover:shadow-lg hover:shadow-gray-500/20',
        border: 'hover:border-gray-500',
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
  }
);

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
          <Box className="border-b border-gray-700 pb-3 mb-4">
            {typeof header === 'string' ? (
              <h3 className="text-lg font-semibold text-gray-300">{header}</h3>
            ) : (
              header
            )}
          </Box>
        )}
        
        {children && (
          <Box className="text-gray-300">
            {children}
          </Box>
        )}
        
        {footer && (
          <Box className="border-t border-gray-700 pt-3 mt-4">
            {footer}
          </Box>
        )}
      </Box>
    );
  }
);

Card.displayName = 'Card';

export { Card, cardVariants };