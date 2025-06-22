'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const containerVariants = cva('mx-auto px-4 w-full', {
  variants: {
    size: {
      sm: 'max-w-screen-sm', // 640px
      md: 'max-w-screen-md', // 768px
      lg: 'max-w-screen-lg', // 1024px
      xl: 'max-w-screen-xl', // 1280px
      '2xl': 'max-w-screen-2xl', // 1536px
      full: 'max-w-full',
      none: '',
    },
    padding: {
      none: 'px-0',
      xs: 'px-2 sm:px-4',
      sm: 'px-4 sm:px-6',
      md: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12',
      xl: 'px-8 sm:px-12 lg:px-16',
    },
    center: {
      true: 'flex flex-col items-center justify-center',
      false: '',
    },
    minHeight: {
      none: '',
      screen: 'min-h-screen',
      content: 'min-h-[calc(100vh-4rem)]', // ヘッダー分を引いた高さ
      half: 'min-h-[50vh]',
    },
  },
  defaultVariants: {
    size: 'xl',
    padding: 'md',
    center: false,
    minHeight: 'none',
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
  children?: React.ReactNode;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    { className, size, padding, center, minHeight, as: Component = 'div', children, ...props },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        className={containerVariants({ size, padding, center, minHeight, className })}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = 'Container';

// Fluid Container - レスポンシブな流体レイアウト
export interface FluidContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  maxWidth?: string;
  padding?: boolean;
}

export const FluidContainer = React.forwardRef<HTMLDivElement, FluidContainerProps>(
  ({ className, maxWidth = '1400px', padding = true, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`w-full ${padding ? 'px-4 sm:px-6 lg:px-8' : ''} ${className || ''}`}
        style={{
          maxWidth,
          marginLeft: 'auto',
          marginRight: 'auto',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FluidContainer.displayName = 'FluidContainer';

// Page Container - ページ全体のコンテナ
export interface PageContainerProps extends ContainerProps {
  withBackground?: boolean;
  backgroundPattern?: 'mythologia' | 'gradient' | 'none';
}

export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  (
    {
      className,
      withBackground = true,
      backgroundPattern = 'mythologia',
      children,
      minHeight = 'screen',
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative">
        {withBackground && backgroundPattern !== 'none' && (
          <div
            className="fixed inset-0 pointer-events-none opacity-5"
            style={
              backgroundPattern === 'mythologia'
                ? {
                    background: `
                      radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.2) 0%, transparent 50%),
                      repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(255, 255, 255, 0.01) 10px,
                        rgba(255, 255, 255, 0.01) 20px
                      )
                    `,
                  }
                : {
                    background: `
                      radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)
                    `,
                  }
            }
          />
        )}
        <Container
          ref={ref}
          className={`relative z-10 ${className || ''}`}
          minHeight={minHeight}
          {...props}
        >
          {children}
        </Container>
      </div>
    );
  }
);

PageContainer.displayName = 'PageContainer';

export { Container, containerVariants };
