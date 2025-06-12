'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const textVariants = cva(
  'transition-colors',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
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
      weight: {
        thin: 'font-thin',
        extralight: 'font-extralight',
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
        black: 'font-black',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
      italic: {
        true: 'italic',
        false: 'not-italic',
      },
      decoration: {
        none: 'no-underline',
        underline: 'underline',
        'line-through': 'line-through',
        overline: 'overline',
      },
      transform: {
        none: 'normal-case',
        uppercase: 'uppercase',
        lowercase: 'lowercase',
        capitalize: 'capitalize',
      },
      leading: {
        none: 'leading-none',
        tight: 'leading-tight',
        snug: 'leading-snug',
        normal: 'leading-normal',
        relaxed: 'leading-relaxed',
        loose: 'leading-loose',
      },
      tracking: {
        tighter: 'tracking-tighter',
        tight: 'tracking-tight',
        normal: 'tracking-normal',
        wide: 'tracking-wide',
        wider: 'tracking-wider',
        widest: 'tracking-widest',
      },
    },
    defaultVariants: {
      size: 'base',
      variant: 'default',
      weight: 'normal',
      align: 'left',
      italic: false,
      decoration: 'none',
      transform: 'none',
      leading: 'normal',
      tracking: 'normal',
    },
  }
);

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div' | 'small' | 'strong' | 'em' | 'mark' | 'del' | 'ins' | 'sub' | 'sup';
  children?: React.ReactNode;
  truncate?: boolean;
  clamp?: number;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ 
    className, 
    size, 
    variant, 
    weight,
    align,
    italic,
    decoration,
    transform,
    leading,
    tracking,
    as: Component = 'p',
    truncate = false,
    clamp,
    children, 
    ...props 
  }, ref) => {
    const truncateClass = truncate ? 'truncate' : '';
    const clampClass = clamp ? `line-clamp-${clamp}` : '';

    return (
      <Component
        ref={ref as React.ForwardedRef<HTMLElement>}
        className={`${textVariants({ 
          size, 
          variant, 
          weight,
          align,
          italic,
          decoration,
          transform,
          leading,
          tracking,
          className 
        })} ${truncateClass} ${clampClass}`.trim()}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

// Convenience components
export const Paragraph = React.forwardRef<HTMLParagraphElement, Omit<TextProps, 'as'>>(
  (props, ref) => <Text ref={ref} as="p" {...props} />
);
Paragraph.displayName = 'Paragraph';

export const Span = React.forwardRef<HTMLSpanElement, Omit<TextProps, 'as'>>(
  (props, ref) => <Text ref={ref as React.ForwardedRef<HTMLElement>} as="span" {...props} />
);
Span.displayName = 'Span';

export const Strong = React.forwardRef<HTMLElement, Omit<TextProps, 'as' | 'weight'>>(
  (props, ref) => <Text ref={ref as React.ForwardedRef<HTMLElement>} as="strong" weight="bold" {...props} />
);
Strong.displayName = 'Strong';

export const Em = React.forwardRef<HTMLElement, Omit<TextProps, 'as' | 'italic'>>(
  (props, ref) => <Text ref={ref as React.ForwardedRef<HTMLElement>} as="em" italic {...props} />
);
Em.displayName = 'Em';

export const Small = React.forwardRef<HTMLElement, Omit<TextProps, 'as' | 'size'>>(
  (props, ref) => <Text ref={ref as React.ForwardedRef<HTMLElement>} as="small" size="sm" {...props} />
);
Small.displayName = 'Small';

export const Mark = React.forwardRef<HTMLElement, Omit<TextProps, 'as'>>(
  (props, ref) => <Text ref={ref as React.ForwardedRef<HTMLElement>} as="mark" className="bg-yellow-400/20 px-1" {...props} />
);
Mark.displayName = 'Mark';

export { Text, textVariants };