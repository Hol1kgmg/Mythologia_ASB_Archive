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
        default: 'divide-y divide-gray-600',
        bordered: 'space-y-2',
        flush: 'divide-y divide-gray-600',
        borderless: 'space-y-1',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      showBorder: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        showBorder: false,
        className: 'divide-y-0',
      },
      {
        variant: 'flush',
        showBorder: false,
        className: 'divide-y-0',
      },
      {
        variant: 'bordered',
        showBorder: false,
        className: 'space-y-1',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      showBorder: true,
    },
  }
);

const accordionItemVariants = cva(
  'w-full',
  {
    variants: {
      variant: {
        default: '',
        bordered: 'border border-gray-600 rounded-lg overflow-hidden',
        flush: '',
        borderless: '',
      },
      showBorder: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'bordered',
        showBorder: false,
        className: 'border-0 rounded-none overflow-visible',
      },
    ],
    defaultVariants: {
      variant: 'default',
      showBorder: true,
    },
  }
);

const accordionButtonVariants = cva(
  'flex w-full items-center justify-between text-left transition-all duration-200 focus:outline-none',
  {
    variants: {
      variant: {
        default: 'py-3 px-2 hover:text-gray-100',
        bordered: 'py-4 px-6 hover:bg-gray-600/50',
        flush: 'py-3 px-2 hover:text-gray-100',
        borderless: 'py-3 px-2 hover:text-gray-100',
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
  'overflow-hidden text-gray-200',
  {
    variants: {
      variant: {
        default: 'pb-3 pl-2 pr-2',
        bordered: 'px-4 pb-3',
        flush: 'pb-3 pl-2 pr-2',
        borderless: 'pb-3 pl-2 pr-2',
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
  showBorder?: boolean;
}

export function Accordion({
  items,
  variant,
  size,
  allowMultiple = false,
  className,
  itemClassName,
  showBorder = true,
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
      <Box className={accordionVariants({ variant, size, showBorder, className })}>
        {items.map((item) => (
          <Box key={item.id} className={accordionItemVariants({ variant, showBorder, className: itemClassName })}>
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
                      <span className={`font-medium text-gray-200 ${item.disabled ? 'opacity-50' : ''}`}>
                        {item.title}
                      </span>
                    </Box>
                    <ChevronDownIcon
                      className={`h-5 w-5 text-gray-200 transition-transform duration-200 ${
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
    <Box className={accordionVariants({ variant, size, showBorder, className })}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <Box key={item.id} className={accordionItemVariants({ variant, showBorder, className: itemClassName })}>
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              className={accordionButtonVariants({ variant, size })}
            >
              <Box className="flex items-center gap-3">
                {item.icon && (
                  <span className="flex-shrink-0">{item.icon}</span>
                )}
                <span className={`font-medium text-gray-200 ${item.disabled ? 'opacity-50' : ''}`}>
                  {item.title}
                </span>
              </Box>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-300 transition-transform duration-200 ${
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
  showBorder?: boolean;
}

export function AccordionItem({
  title,
  children,
  icon,
  disabled = false,
  defaultOpen = false,
  variant,
  className,
  showBorder = true,
}: AccordionItemProps) {
  return (
    <Box className={accordionItemVariants({ variant, showBorder, className })}>
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
                <span className={`font-medium text-gray-200 ${disabled ? 'opacity-50' : ''}`}>
                  {title}
                </span>
              </Box>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-300 transition-transform duration-200 ${
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

// Horizontal Accordion Component
export interface HorizontalAccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  defaultOpen?: boolean;
  width?: string;
}

export interface HorizontalAccordionProps {
  items: HorizontalAccordionItem[];
  allowMultiple?: boolean;
  className?: string;
  itemClassName?: string;
  buttonWidth?: string;
  contentWidth?: string;
  direction?: 'left' | 'right';
  showBorder?: boolean;
}

const horizontalAccordionItemVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        left: 'border-r border-gray-600 last:border-r-0',
        right: 'border-l border-gray-600 first:border-l-0 flex-row-reverse',
      },
      isOpen: {
        true: '',
        false: '',
      },
      showBorder: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        direction: 'left',
        showBorder: false,
        className: 'border-r-0 last:border-r-0',
      },
      {
        direction: 'right',
        showBorder: false,
        className: 'border-l-0 first:border-l-0',
      },
    ],
    defaultVariants: {
      direction: 'right',
      isOpen: false,
      showBorder: true,
    },
  }
);

const horizontalAccordionButtonVariants = cva(
  'flex flex-col items-center justify-center text-center transition-all duration-200 focus:outline-none bg-gray-600 hover:bg-gray-600',
  {
    variants: {
      isOpen: {
        true: 'bg-gray-600',
        false: 'bg-gray-600',
      },
    },
    defaultVariants: {
      isOpen: false,
    },
  }
);

const horizontalAccordionContentVariants = cva(
  'overflow-hidden bg-gray-600',
  {
    variants: {
      direction: {
        left: 'border-l border-gray-600',
        right: 'border-r border-gray-600',
      },
      variant: {
        default: 'p-4',
        compact: 'p-3',
        spacious: 'p-6',
      },
      showBorder: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        direction: 'left',
        showBorder: false,
        className: 'border-l-0',
      },
      {
        direction: 'right',
        showBorder: false,
        className: 'border-r-0',
      },
    ],
    defaultVariants: {
      direction: 'right',
      variant: 'default',
      showBorder: true,
    },
  }
);

export function HorizontalAccordion({
  items,
  allowMultiple = false,
  className,
  itemClassName,
  buttonWidth = 'w-16',
  contentWidth = 'w-80',
  direction = 'right',
  showBorder = true,
}: HorizontalAccordionProps) {
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
      <Box className={`flex h-96 ${showBorder ? 'border border-gray-600 rounded-lg' : ''} overflow-hidden ${direction === 'left' ? 'flex-row-reverse' : ''} ${className || ''}`}>
        {items.map((item) => (
          <Box key={item.id} className={horizontalAccordionItemVariants({ direction, showBorder, className: itemClassName })}>
            <Disclosure defaultOpen={item.defaultOpen}>
              {({ open }) => (
                <div className={`flex h-full ${direction === 'right' ? '' : 'flex-row-reverse'}`}>
                  <Disclosure.Button
                    disabled={item.disabled}
                    className={`${horizontalAccordionButtonVariants({ isOpen: open })} ${buttonWidth} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Box className="flex flex-col items-center justify-center h-full p-2">
                      {item.icon ? (
                        <span className="text-gray-200">{item.icon}</span>
                      ) : (
                        <span className="font-medium text-gray-200 text-xs">
                          {item.title.charAt(0)}
                        </span>
                      )}
                    </Box>
                  </Disclosure.Button>
                  <Transition
                    enter="transition-all duration-300 ease-out"
                    enterFrom="w-0 opacity-0"
                    enterTo={`${item.width || contentWidth} opacity-100`}
                    leave="transition-all duration-300 ease-in"
                    leaveFrom={`${item.width || contentWidth} opacity-100`}
                    leaveTo="w-0 opacity-0"
                  >
                    <Disclosure.Panel className={`${horizontalAccordionContentVariants({ direction, showBorder })} ${item.width || contentWidth}`}>
                      <div className="text-gray-200 h-full overflow-y-auto">
                        {item.content}
                      </div>
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
    <Box className={`flex h-96 ${showBorder ? 'border border-gray-600 rounded-lg' : ''} overflow-hidden ${direction === 'left' ? 'flex-row-reverse' : ''} ${className || ''}`}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <Box key={item.id} className={horizontalAccordionItemVariants({ direction, showBorder, isOpen, className: itemClassName })}>
            <div className={`flex h-full ${direction === 'right' ? '' : 'flex-row-reverse'}`}>
              <button
                onClick={() => !item.disabled && toggleItem(item.id)}
                disabled={item.disabled}
                className={`${horizontalAccordionButtonVariants({ isOpen })} ${buttonWidth} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Box className="flex flex-col items-center justify-center h-full p-2">
                  {item.icon ? (
                    <span className="text-gray-200">{item.icon}</span>
                  ) : (
                    <span className="font-medium text-gray-200 text-xs">
                      {item.title.charAt(0)}
                    </span>
                  )}
                </Box>
              </button>
              <Transition
                show={isOpen}
                enter="transition-all duration-300 ease-out"
                enterFrom="w-0 opacity-0"
                enterTo={`${item.width || contentWidth} opacity-100`}
                leave="transition-all duration-300 ease-in"
                leaveFrom={`${item.width || contentWidth} opacity-100`}
                leaveTo="w-0 opacity-0"
              >
                <Box className={`${horizontalAccordionContentVariants({ direction, showBorder })} ${item.width || contentWidth}`}>
                  <div className="text-gray-200 h-full overflow-y-auto">
                    {item.content}
                  </div>
                </Box>
              </Transition>
            </div>
          </Box>
        );
      })}
    </Box>
  );
}