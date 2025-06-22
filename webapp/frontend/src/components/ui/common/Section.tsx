'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const sectionVariants = cva('relative', {
  variants: {
    spacing: {
      none: '',
      xs: 'py-4 sm:py-6',
      sm: 'py-6 sm:py-8',
      md: 'py-8 sm:py-12',
      lg: 'py-12 sm:py-16',
      xl: 'py-16 sm:py-24',
      '2xl': 'py-24 sm:py-32',
    },
    background: {
      none: '',
      default: 'bg-gray-900',
      darker: 'bg-black',
      lighter: 'bg-gray-800',
      gradient: 'bg-gradient-to-b from-gray-900 to-black',
      gradientReverse: 'bg-gradient-to-b from-black to-gray-900',
    },
    border: {
      none: '',
      top: 'border-t border-gray-800',
      bottom: 'border-b border-gray-800',
      both: 'border-y border-gray-800',
    },
    overflow: {
      visible: 'overflow-visible',
      hidden: 'overflow-hidden',
      clip: 'overflow-clip',
    },
  },
  defaultVariants: {
    spacing: 'md',
    background: 'none',
    border: 'none',
    overflow: 'visible',
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  as?: React.ElementType;
  children?: React.ReactNode;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  withContainer?: boolean;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      spacing,
      background,
      border,
      overflow,
      as: Component = 'section',
      children,
      containerSize = 'xl',
      withContainer = true,
      ...props
    },
    ref
  ) => {
    const containerClasses = {
      sm: 'max-w-screen-sm mx-auto px-4',
      md: 'max-w-screen-md mx-auto px-4',
      lg: 'max-w-screen-lg mx-auto px-4',
      xl: 'max-w-screen-xl mx-auto px-4',
      '2xl': 'max-w-screen-2xl mx-auto px-4',
      full: 'w-full px-4',
      none: '',
    };

    return (
      <Component
        ref={ref}
        className={sectionVariants({ spacing, background, border, overflow, className })}
        {...props}
      >
        {withContainer ? (
          <div className={containerClasses[containerSize]}>{children}</div>
        ) : (
          children
        )}
      </Component>
    );
  }
);

Section.displayName = 'Section';

// Hero Section - ヒーローセクション専用
export interface HeroSectionProps extends Omit<SectionProps, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  backgroundImage?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  (
    {
      className,
      title,
      subtitle,
      description,
      actions,
      backgroundImage,
      overlay = true,
      overlayOpacity = 0.6,
      children,
      spacing = 'xl',
      ...props
    },
    ref
  ) => {
    return (
      <Section ref={ref} className={`relative ${className || ''}`} spacing={spacing} {...props}>
        {backgroundImage && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            {overlay && (
              <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
            )}
          </>
        )}
        <div className="relative z-10 text-center">
          {title && (
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">{title}</h1>
          )}
          {subtitle && (
            <p className="text-lg sm:text-xl text-gray-300 mb-4 max-w-2xl mx-auto">{subtitle}</p>
          )}
          {description && (
            <p className="text-sm text-gray-400 mb-8 max-w-2xl mx-auto">{description}</p>
          )}
          {actions && <div className="flex flex-wrap gap-4 justify-center mb-8">{actions}</div>}
          {children}
        </div>
      </Section>
    );
  }
);

HeroSection.displayName = 'HeroSection';

// Feature Section - 機能紹介セクション
export interface FeatureSectionProps extends Omit<SectionProps, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const FeatureSection = React.forwardRef<HTMLElement, FeatureSectionProps>(
  ({ className, title, description, align = 'center', children, ...props }, ref) => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    return (
      <Section ref={ref} className={`${alignClasses[align]} ${className || ''}`} {...props}>
        {title && (
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">{title}</h2>
        )}
        {description && (
          <p
            className={`text-lg text-gray-300 mb-8 ${
              align === 'center' ? 'max-w-2xl mx-auto' : ''
            }`}
          >
            {description}
          </p>
        )}
        {children}
      </Section>
    );
  }
);

FeatureSection.displayName = 'FeatureSection';

export { Section, sectionVariants };
