'use client';

import React, { Fragment } from 'react';
import { Popover as HeadlessPopover, Transition } from '@headlessui/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Box } from '..';

const popoverVariants = cva(
  'absolute z-10 mt-3 transform px-4 sm:px-0',
  {
    variants: {
      placement: {
        'bottom-start': 'left-0',
        'bottom-center': 'left-1/2 -translate-x-1/2',
        'bottom-end': 'right-0',
        'top-start': 'left-0 bottom-full mb-3 mt-0',
        'top-center': 'left-1/2 -translate-x-1/2 bottom-full mb-3 mt-0',
        'top-end': 'right-0 bottom-full mb-3 mt-0',
        'left-start': 'right-full mr-3 mt-0 top-0',
        'left-center': 'right-full mr-3 mt-0 top-1/2 -translate-y-1/2',
        'left-end': 'right-full mr-3 mt-0 bottom-0',
        'right-start': 'left-full ml-3 mt-0 top-0',
        'right-center': 'left-full ml-3 mt-0 top-1/2 -translate-y-1/2',
        'right-end': 'left-full ml-3 mt-0 bottom-0',
      },
      size: {
        sm: 'max-w-xs',
        md: 'max-w-sm',
        lg: 'max-w-md',
        xl: 'max-w-lg',
        '2xl': 'max-w-2xl',
      },
    },
    defaultVariants: {
      placement: 'bottom-start',
      size: 'md',
    },
  }
);

const popoverPanelVariants = cva(
  'rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-gray-800 border border-gray-700',
        dark: 'bg-gray-900 border border-gray-600',
        glass: 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50',
        tooltip: 'bg-gray-900 border border-gray-600 text-xs',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface PopoverProps extends VariantProps<typeof popoverVariants> {
  trigger: React.ReactNode;
  children: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  variant?: VariantProps<typeof popoverPanelVariants>['variant'];
  padding?: VariantProps<typeof popoverPanelVariants>['padding'];
  className?: string;
  panelClassName?: string;
  disabled?: boolean;
  closeOnClickOutside?: boolean;
}

export function Popover({
  trigger,
  children,
  placement,
  size,
  variant = 'default',
  padding = 'md',
  className,
  panelClassName,
  disabled = false,
  closeOnClickOutside = true,
}: PopoverProps) {
  return (
    <HeadlessPopover className="relative">
      {({ close }) => (
        <>
          <HeadlessPopover.Button 
            disabled={disabled}
            className="focus:outline-none"
            onClick={(e) => {
              if (disabled) {
                e.preventDefault();
              }
            }}
          >
            {trigger}
          </HeadlessPopover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <HeadlessPopover.Panel 
              className={popoverVariants({ placement, size, className })}
              static={!closeOnClickOutside}
            >
              <Box className={popoverPanelVariants({ variant, padding, className: panelClassName })}>
                <div className="text-gray-300">
                  {typeof children === 'function' ? children({ close }) : children}
                </div>
              </Box>
            </HeadlessPopover.Panel>
          </Transition>
        </>
      )}
    </HeadlessPopover>
  );
}

// Tooltip component (simplified popover)
export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: VariantProps<typeof popoverVariants>['placement'];
  delay?: number;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  placement = 'top-center',
  delay = 500,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <Transition
        show={isVisible}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className={popoverVariants({ placement, size: 'sm' })}>
          <Box className={popoverPanelVariants({ variant: 'tooltip', padding: 'sm' })}>
            <div className="text-gray-300 text-xs whitespace-nowrap">
              {content}
            </div>
          </Box>
        </div>
      </Transition>
    </div>
  );
}

// Dropdown Menu component (popover with menu items)
export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: VariantProps<typeof popoverVariants>['placement'];
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  placement = 'bottom-start',
  className,
}: DropdownMenuProps) {
  return (
    <Popover
      trigger={trigger}
      placement={placement}
      variant="default"
      padding="none"
      className={className}
    >
      {({ close }) => (
        <Box className="py-1">
          {items.map((item) => (
            <Fragment key={item.id}>
              {item.separator && <hr className="my-1 border-gray-700" />}
              <button
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    close();
                  }
                }}
                disabled={item.disabled}
                className={`
                  w-full text-left px-4 py-2 text-sm transition-colors duration-200
                  ${item.disabled 
                    ? 'text-gray-500 cursor-not-allowed' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <Box className="flex items-center gap-3">
                  {item.icon && (
                    <span className="flex-shrink-0">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </Box>
              </button>
            </Fragment>
          ))}
        </Box>
      )}
    </Popover>
  );
}