'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const skeletonVariants = cva(
  'animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] rounded',
  {
    variants: {
      variant: {
        text: 'h-4',
        title: 'h-6',
        button: 'h-10',
        avatar: 'rounded-full',
        card: 'h-32',
        image: 'h-48',
      },
      animation: {
        pulse: 'animate-pulse',
        wave: 'animate-wave',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'text',
      animation: 'pulse',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
  spacing?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant,
      animation,
      width,
      height,
      circle = false,
      count = 1,
      spacing = '0.5rem',
      style,
      ...props
    },
    ref
  ) => {
    const skeletonStyle: React.CSSProperties = {
      width,
      height,
      ...style,
    };

    if (circle) {
      skeletonStyle.borderRadius = '50%';
      if (width && !height) {
        skeletonStyle.height = width;
      }
    }

    if (count === 1) {
      return (
        <div
          ref={ref}
          className={skeletonVariants({ variant, animation, className })}
          style={skeletonStyle}
          {...props}
        />
      );
    }

    return (
      <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={skeletonVariants({ variant, animation, className })}
            style={skeletonStyle}
            {...props}
          />
        ))}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Preset Skeleton Components
export interface SkeletonTextProps {
  lines?: number;
  spacing?: string;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  spacing = '0.5rem',
  className,
}) => {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '60%' : '100%'}
          style={{ marginBottom: index === lines - 1 ? 0 : spacing }}
        />
      ))}
    </div>
  );
};

export interface SkeletonCardProps {
  showAvatar?: boolean;
  showTitle?: boolean;
  showText?: boolean;
  textLines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = true,
  showTitle = true,
  showText = true,
  textLines = 3,
  className,
}) => {
  return (
    <div className={`p-4 space-y-4 ${className || ''}`}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <Skeleton circle width={40} height={40} />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="20%" />
          </div>
        </div>
      )}

      {showTitle && <Skeleton variant="title" width="80%" />}

      {showText && <SkeletonText lines={textLines} />}
    </div>
  );
};

export interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  showAvatar = true,
  className,
}) => {
  return (
    <div className={`space-y-3 ${className || ''}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          {showAvatar && <Skeleton circle width={32} height={32} />}
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
};

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}) => {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {showHeader && (
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`header-${index}`} variant="text" height={16} className="flex-1" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export { Skeleton, skeletonVariants };
