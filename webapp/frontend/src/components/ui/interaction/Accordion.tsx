'use client';

import React from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { Box } from '..';

const accordionVariants = cva(
  'w-full',
  {
    variants: {
      variant: {
        default: 'divide-y divide-gray-700',
        bordered: 'space-y-2',
        flush: 'divide-y divide-gray-700',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const accordionItemVariants = cva(
  'w-full',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border border-gray-700 rounded-lg overflow-hidden',
        flush: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const accordionButtonVariants = cva(
  'flex w-full items-center justify-between text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-inset',
  {
    variants: {
      variant: {
        default: 'py-4 px-0 hover:text-gray-200 focus:ring-gray-500',
        bordered: 'py-4 px-6 hover:bg-gray-700/50 focus:ring-gray-500',
        flush: 'py-4 px-0 hover:text-gray-200 focus:ring-gray-500',
      },
      size: {
        sm: 'py-3 text-sm',
        md: 'py-4 text-base',
        lg: 'py-5 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const accordionContentVariants = cva(
  'overflow-hidden text-gray-400',
  {
    variants: {
      variant: {
        default: 'pb-4',
        bordered: 'px-6 pb-4',
        flush: 'pb-4',
      },
      size: {
        sm: 'text-sm',
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

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  defaultOpen?: boolean;
}

export interface AccordionProps extends VariantProps<typeof accordionVariants> {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
  itemClassName?: string;
}

export function Accordion({
  items,
  variant,
  size,
  allowMultiple = false,
  className,
  itemClassName,
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(
    new Set(items.filter(item => item.defaultOpen).map(item => item.id))
  );

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (allowMultiple) {
    // Multiple items can be open - use individual Disclosure components
    return (
      <Box className={accordionVariants({ variant, size, className })}>
        {items.map((item) => (
          <Box key={item.id} className={accordionItemVariants({ variant, className: itemClassName })}>
            <Disclosure defaultOpen={item.defaultOpen}>
              {({ open }) => (
                <div>
                  <Disclosure.Button
                    disabled={item.disabled}
                    className={accordionButtonVariants({ variant, size })}
                  >
                    <Box className="flex items-center gap-3">
                      {item.icon && (
                        <span className="flex-shrink-0">{item.icon}</span>
                      )}
                      <span className={`font-medium text-gray-300 ${item.disabled ? 'opacity-50' : ''}`}>
                        {item.title}
                      </span>
                    </Box>
                    <ChevronDownIcon
                      className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                      } ${item.disabled ? 'opacity-50' : ''}`}
                    />
                  </Disclosure.Button>
                  <Transition
                    enter="transition duration-200 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Disclosure.Panel className={accordionContentVariants({ variant, size })}>
                      {item.content}
                    </Disclosure.Panel>
                  </Transition>
                </div>
              )}
            </Disclosure>
          </Box>
        ))}
      </Box>
    );
  }

  // Single item open at a time - use controlled state
  return (
    <Box className={accordionVariants({ variant, size, className })}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <Box key={item.id} className={accordionItemVariants({ variant, className: itemClassName })}>
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              className={accordionButtonVariants({ variant, size })}
            >
              <Box className="flex items-center gap-3">
                {item.icon && (
                  <span className="flex-shrink-0">{item.icon}</span>
                )}
                <span className={`font-medium text-gray-300 ${item.disabled ? 'opacity-50' : ''}`}>
                  {item.title}
                </span>
              </Box>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                } ${item.disabled ? 'opacity-50' : ''}`}
              />
            </button>
            <Transition
              show={isOpen}
              enter="transition duration-200 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Box className={accordionContentVariants({ variant, size })}>
                {item.content}
              </Box>
            </Transition>
          </Box>
        );
      })}
    </Box>
  );
}

// Single Accordion Item component for more granular control
export interface AccordionItemProps extends VariantProps<typeof accordionItemVariants> {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  icon,
  disabled = false,
  defaultOpen = false,
  variant,
  className,
}: AccordionItemProps) {
  return (
    <Box className={accordionItemVariants({ variant, className })}>
      <Disclosure defaultOpen={defaultOpen}>
        {({ open }) => (
          <div>
            <Disclosure.Button
              disabled={disabled}
              className={accordionButtonVariants({ variant })}
            >
              <Box className="flex items-center gap-3">
                {icon && (
                  <span className="flex-shrink-0">{icon}</span>
                )}
                <span className={`font-medium text-gray-300 ${disabled ? 'opacity-50' : ''}`}>
                  {title}
                </span>
              </Box>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  open ? 'rotate-180' : ''
                } ${disabled ? 'opacity-50' : ''}`}
              />
            </Disclosure.Button>
            <Transition
              enter="transition duration-200 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel className={accordionContentVariants({ variant })}>
                {children}
              </Disclosure.Panel>
            </Transition>
          </div>
        )}
      </Disclosure>
    </Box>
  );
}