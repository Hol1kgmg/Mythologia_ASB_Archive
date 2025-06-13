'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const headingVariants = cva(
  'font-bold',
  {
    variants: {
      level: {
        h1: 'text-4xl sm:text-5xl lg:text-6xl',
        h2: 'text-3xl sm:text-4xl lg:text-5xl',
        h3: 'text-2xl sm:text-3xl lg:text-4xl',
        h4: 'text-xl sm:text-2xl lg:text-3xl',
        h5: 'text-lg sm:text-xl lg:text-2xl',
        h6: 'text-base sm:text-lg lg:text-xl',
      },
      variant: {
        default: 'text-white',
        gradient: 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent',
        primary: 'text-blue-400',
        secondary: 'text-gray-300',
        muted: 'text-gray-500',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
      },
      tracking: {
        tighter: 'tracking-tighter',
        tight: 'tracking-tight',
        normal: 'tracking-normal',
        wide: 'tracking-wide',
        wider: 'tracking-wider',
        widest: 'tracking-widest',
      },
      leading: {
        none: 'leading-none',
        tight: 'leading-tight',
        snug: 'leading-snug',
        normal: 'leading-normal',
        relaxed: 'leading-relaxed',
        loose: 'leading-loose',
      },
    },
    defaultVariants: {
      level: 'h1',
      variant: 'default',
      align: 'left',
      weight: 'bold',
      tracking: 'normal',
      leading: 'normal',
    },
  }
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children?: React.ReactNode;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 
    className, 
    level = 'h1', 
    variant, 
    align, 
    weight,
    tracking,
    leading,
    as,
    children, 
    ...props 
  }, ref) => {
    const Component = as || level || 'h1';

    return (
      <Component
        ref={ref}
        className={headingVariants({ 
          level, 
          variant, 
          align, 
          weight,
          tracking,
          leading,
          className 
        })}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';

// Convenience components
export const H1 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level' | 'as'>>(
  (props, ref) => <Heading ref={ref} level="h1" as="h1" {...props} />
);
H1.displayName = 'H1';

export const H2 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level' | 'as'>>(
  (props, ref) => <Heading ref={ref} level="h2" as="h2" {...props} />
);
H2.displayName = 'H2';

export const H3 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level' | 'as'>>(
  (props, ref) => <Heading ref={ref} level="h3" as="h3" {...props} />
);
H3.displayName = 'H3';

export const H4 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level' | 'as'>>(
  (props, ref) => <Heading ref={ref} level="h4" as="h4" {...props} />
);
H4.displayName = 'H4';

export const H5 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level' | 'as'>>(
  (props, ref) => <Heading ref={ref} level="h5" as="h5" {...props} />
);
H5.displayName = 'H5';

export const H6 = React.forwardRef<HTMLHeadingElement, Omit<HeadingProps, 'level' | 'as'>>(
  (props, ref) => <Heading ref={ref} level="h6" as="h6" {...props} />
);
H6.displayName = 'H6';

export { Heading, headingVariants };