'use client';

import React from 'react';

interface WarningCardProps {
  title: string;
  description: string;
  icon?: string;
  variant?: 'warning' | 'info' | 'error' | 'success';
}

const variantStyles = {
  warning: {
    container: 'bg-yellow-900 bg-opacity-50 border border-yellow-600',
    icon: 'text-yellow-400',
    title: 'text-yellow-400',
    description: 'text-yellow-200',
  },
  info: {
    container: 'bg-blue-900 bg-opacity-50 border border-blue-600',
    icon: 'text-blue-400',
    title: 'text-blue-400',
    description: 'text-blue-200',
  },
  error: {
    container: 'bg-red-900 bg-opacity-50 border border-red-600',
    icon: 'text-red-400',
    title: 'text-red-400',
    description: 'text-red-200',
  },
  success: {
    container: 'bg-green-900 bg-opacity-50 border border-green-600',
    icon: 'text-green-400',
    title: 'text-green-400',
    description: 'text-green-200',
  },
};

const defaultIcons = {
  warning: '⚠️',
  info: 'ℹ️',
  error: '❌',
  success: '✅',
};

export default function WarningCard({
  title,
  description,
  icon,
  variant = 'warning',
}: WarningCardProps) {
  const styles = variantStyles[variant];
  const displayIcon = icon || defaultIcons[variant];

  return (
    <div className={`${styles.container} rounded-lg p-4 mb-8`}>
      <div className="flex items-center gap-3">
        <span className={`${styles.icon} text-xl`}>{displayIcon}</span>
        <div>
          <h3 className={`${styles.title} font-semibold`}>{title}</h3>
          <p className={`${styles.description} text-sm`}>{description}</p>
        </div>
      </div>
    </div>
  );
}
