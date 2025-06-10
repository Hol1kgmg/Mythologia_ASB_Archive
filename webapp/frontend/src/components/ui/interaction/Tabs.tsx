'use client';

import React from 'react';
import { Tab } from '@headlessui/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Box } from '..';

const tabListVariants = cva(
  'flex space-x-1 rounded-lg p-1',
  {
    variants: {
      variant: {
        default: 'bg-gray-800 border border-gray-700',
        underline: 'bg-transparent border-b border-gray-700',
        pills: 'bg-gray-800/50 backdrop-blur-sm',
        minimal: 'bg-transparent',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const tabVariants = cva(
  'w-full rounded-lg py-2.5 font-medium leading-5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
  {
    variants: {
      variant: {
        default: 'focus:ring-gray-500',
        underline: 'focus:ring-blue-500',
        pills: 'focus:ring-white/20',
        minimal: 'focus:ring-blue-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Default variant
      {
        variant: 'default',
        selected: true,
        className: 'bg-gray-700 text-white shadow',
      },
      {
        variant: 'default',
        selected: false,
        className: 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300',
      },
      // Underline variant
      {
        variant: 'underline',
        selected: true,
        className: 'border-b-2 border-blue-500 text-blue-400',
      },
      {
        variant: 'underline',
        selected: false,
        className: 'text-gray-400 hover:text-gray-300 border-b-2 border-transparent',
      },
      // Pills variant
      {
        variant: 'pills',
        selected: true,
        className: 'bg-white text-gray-900 shadow-sm',
      },
      {
        variant: 'pills',
        selected: false,
        className: 'text-gray-400 hover:bg-white/10 hover:text-white',
      },
      // Minimal variant
      {
        variant: 'minimal',
        selected: true,
        className: 'text-blue-400 font-semibold',
      },
      {
        variant: 'minimal',
        selected: false,
        className: 'text-gray-400 hover:text-gray-300',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      selected: false,
    },
  }
);

const tabPanelVariants = cva(
  'rounded-lg bg-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500',
  {
    variants: {
      variant: {
        default: 'bg-gray-800 border border-gray-700',
        glass: 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50',
        minimal: 'bg-transparent border-none p-0',
      },
      spacing: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      spacing: 'md',
    },
  }
);

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface TabsProps extends VariantProps<typeof tabListVariants> {
  tabs: TabItem[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
  tabListClassName?: string;
  tabPanelClassName?: string;
  panelVariant?: VariantProps<typeof tabPanelVariants>['variant'];
  panelSpacing?: VariantProps<typeof tabPanelVariants>['spacing'];
}

export function Tabs({
  tabs,
  defaultIndex = 0,
  onChange,
  variant,
  size,
  className,
  tabListClassName,
  tabPanelClassName,
  panelVariant = 'default',
  panelSpacing = 'md',
}: TabsProps) {
  return (
    <Box className={className}>
      <Tab.Group defaultIndex={defaultIndex} onChange={onChange}>
        <Tab.List className={tabListVariants({ variant, size, className: tabListClassName })}>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              disabled={tab.disabled}
              className={({ selected }) => tabVariants({ variant, size, selected })}
            >
              {({ selected }) => (
                <Box className="flex items-center justify-center gap-2">
                  {tab.icon && (
                    <span className={`${selected ? '' : 'opacity-70'}`}>
                      {tab.icon}
                    </span>
                  )}
                  <span>{tab.label}</span>
                </Box>
              )}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {tabs.map((tab) => (
            <Tab.Panel
              key={tab.id}
              className={tabPanelVariants({ 
                variant: panelVariant, 
                spacing: panelSpacing, 
                className: tabPanelClassName 
              })}
            >
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </Box>
  );
}

// Vertical Tabs variant
export interface VerticalTabsProps extends Omit<TabsProps, 'variant'> {
  tabWidth?: string;
}

export function VerticalTabs({
  tabs,
  defaultIndex = 0,
  onChange,
  size,
  className,
  tabListClassName,
  tabPanelClassName,
  panelVariant = 'default',
  panelSpacing = 'md',
  tabWidth = 'w-48',
}: VerticalTabsProps) {
  return (
    <Box className={`flex gap-4 ${className || ''}`}>
      <Tab.Group defaultIndex={defaultIndex} onChange={onChange}>
        <Tab.List className={`${tabWidth} flex flex-col space-y-1 rounded-lg bg-gray-800 border border-gray-700 p-1 ${tabListClassName || ''}`}>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              disabled={tab.disabled}
              className={({ selected }) => tabVariants({ variant: 'default', size, selected })}
            >
              {({ selected }) => (
                <Box className="flex items-center gap-3 w-full text-left">
                  {tab.icon && (
                    <span className={`flex-shrink-0 ${selected ? '' : 'opacity-70'}`}>
                      {tab.icon}
                    </span>
                  )}
                  <span className="flex-1">{tab.label}</span>
                </Box>
              )}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="flex-1">
          {tabs.map((tab) => (
            <Tab.Panel
              key={tab.id}
              className={tabPanelVariants({ 
                variant: panelVariant, 
                spacing: panelSpacing, 
                className: tabPanelClassName 
              })}
            >
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </Box>
  );
}