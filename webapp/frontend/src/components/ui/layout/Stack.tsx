import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Box } from './Box';

const stackVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        row: 'flex-row',
        column: 'flex-col',
        rowReverse: 'flex-row-reverse',
        columnReverse: 'flex-col-reverse',
      },
      spacing: {
        none: 'gap-0',
        xs: 'gap-1',
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
        '2xl': 'gap-12',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
        baseline: 'items-baseline',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      wrap: {
        true: 'flex-wrap',
        false: 'flex-nowrap',
        reverse: 'flex-wrap-reverse',
      },
      divider: {
        true: '[&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-gray-700 [&>*:not(:last-child)]:pr-4',
        vertical: '[&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-gray-700 [&>*:not(:last-child)]:pb-4',
        false: '',
      },
    },
    defaultVariants: {
      direction: 'column',
      spacing: 'md',
      align: 'stretch',
      justify: 'start',
      wrap: false,
      divider: false,
    },
  }
);

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  children?: React.ReactNode;
  as?: React.ElementType;
}

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, spacing, align, justify, wrap, divider, children, as, ...props }, ref) => {
    const Component = as || 'div';
    
    return (
      <Box
        ref={ref}
        as={Component}
        className={stackVariants({ direction, spacing, align, justify, wrap, divider, className })}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

Stack.displayName = 'Stack';

// HStack (Horizontal Stack) - shorthand for row direction
export type HStackProps = Omit<StackProps, 'direction'>;

const HStack = forwardRef<HTMLDivElement, HStackProps>(
  (props, ref) => {
    return <Stack ref={ref} direction="row" {...props} />;
  }
);

HStack.displayName = 'HStack';

// VStack (Vertical Stack) - shorthand for column direction  
export type VStackProps = Omit<StackProps, 'direction'>;

const VStack = forwardRef<HTMLDivElement, VStackProps>(
  (props, ref) => {
    return <Stack ref={ref} direction="column" {...props} />;
  }
);

VStack.displayName = 'VStack';

// Spacer component for flexible spacing
export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'auto' | 'full';
}

const Spacer = forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size = 'auto', ...props }, ref) => {
    const spacerClass = size === 'full' ? 'flex-1' : 'flex-grow';
    
    return (
      <Box
        ref={ref}
        className={`${spacerClass} ${className || ''}`}
        {...props}
      />
    );
  }
);

Spacer.displayName = 'Spacer';

export { Stack, HStack, VStack, Spacer, stackVariants };