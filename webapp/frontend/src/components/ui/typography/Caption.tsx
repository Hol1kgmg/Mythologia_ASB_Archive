'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const captionVariants = cva('text-xs transition-colors', {
  variants: {
    variant: {
      default: 'text-gray-500',
      primary: 'text-gray-400',
      secondary: 'text-gray-600',
      muted: 'text-gray-600',
      accent: 'text-blue-400/80',
      success: 'text-green-400/80',
      warning: 'text-yellow-400/80',
      error: 'text-red-400/80',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
    italic: {
      true: 'italic',
      false: 'not-italic',
    },
  },
  defaultVariants: {
    variant: 'default',
    align: 'left',
    italic: false,
  },
});

export interface CaptionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof captionVariants> {
  as?: 'figcaption' | 'caption' | 'span';
  children?: React.ReactNode;
}

const Caption = React.forwardRef<HTMLElement, CaptionProps>(
  ({ className, variant, align, italic, as = 'figcaption', children, ...props }, ref) => {
    const classes = captionVariants({
      variant,
      align,
      italic,
      className,
    });

    if (as === 'figcaption') {
      return (
        <figcaption ref={ref as React.ForwardedRef<HTMLElement>} className={classes} {...props}>
          {children}
        </figcaption>
      );
    }

    if (as === 'caption') {
      return (
        <caption
          ref={ref as React.ForwardedRef<HTMLTableCaptionElement>}
          className={classes}
          {...props}
        >
          {children}
        </caption>
      );
    }

    if (as === 'span') {
      return (
        <span ref={ref as React.ForwardedRef<HTMLSpanElement>} className={classes} {...props}>
          {children}
        </span>
      );
    }

    // Default fallback
    return (
      <figcaption ref={ref as React.ForwardedRef<HTMLElement>} className={classes} {...props}>
        {children}
      </figcaption>
    );
  }
);

Caption.displayName = 'Caption';

// Figure with Caption Component
export interface FigureWithCaptionProps {
  children?: React.ReactNode;
  caption?: React.ReactNode;
  captionProps?: Omit<CaptionProps, 'children'>;
  className?: string;
}

export const FigureWithCaption: React.FC<FigureWithCaptionProps> = ({
  children,
  caption,
  captionProps,
  className,
}) => {
  return (
    <figure className={`space-y-2 ${className || ''}`}>
      {children}
      {caption && <Caption {...captionProps}>{caption}</Caption>}
    </figure>
  );
};

// Table Caption Component
export const TableCaption = React.forwardRef<HTMLElement, Omit<CaptionProps, 'as'>>(
  (props, ref) => <Caption ref={ref} as="caption" align="center" {...props} />
);
TableCaption.displayName = 'TableCaption';

// Image Caption Component
export interface ImageCaptionProps extends CaptionProps {
  credit?: string;
}

export const ImageCaption = React.forwardRef<HTMLElement, ImageCaptionProps>(
  ({ credit, children, className, ...props }, ref) => {
    return (
      <Caption ref={ref} className={`space-y-1 ${className || ''}`} {...props}>
        {children}
        {credit && <span className="text-[10px] opacity-60 block">Credit: {credit}</span>}
      </Caption>
    );
  }
);
ImageCaption.displayName = 'ImageCaption';

// Help Caption Component
export interface HelpCaptionProps extends Omit<CaptionProps, 'variant'> {
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const HelpCaption = React.forwardRef<HTMLElement, HelpCaptionProps>(
  ({ type = 'info', className, ...props }, ref) => {
    const variantMap = {
      info: 'default',
      success: 'success',
      warning: 'warning',
      error: 'error',
    } as const;

    return (
      <Caption
        ref={ref}
        variant={variantMap[type]}
        className={`mt-1 ${className || ''}`}
        as="span"
        {...props}
      />
    );
  }
);
HelpCaption.displayName = 'HelpCaption';

export { Caption, captionVariants };
