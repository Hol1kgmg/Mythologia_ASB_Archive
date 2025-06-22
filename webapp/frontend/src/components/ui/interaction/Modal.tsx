'use client';

import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { Fragment } from 'react';
import { Box, Button } from '..';

const modalVariants = cva(
  'relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all',
  {
    variants: {
      size: {
        xs: 'sm:my-8 sm:w-full sm:max-w-xs',
        sm: 'sm:my-8 sm:w-full sm:max-w-sm',
        md: 'sm:my-8 sm:w-full sm:max-w-md',
        lg: 'sm:my-8 sm:w-full sm:max-w-lg',
        xl: 'sm:my-8 sm:w-full sm:max-w-xl',
        '2xl': 'sm:my-8 sm:w-full sm:max-w-2xl',
        '3xl': 'sm:my-8 sm:w-full sm:max-w-3xl',
        '4xl': 'sm:my-8 sm:w-full sm:max-w-4xl',
        full: 'sm:my-8 sm:w-full sm:max-w-full sm:mx-4',
      },
      variant: {
        default: 'bg-zinc-700 border border-zinc-600',
        dark: 'bg-zinc-800 border border-zinc-500',
        glass: 'bg-zinc-700/90 backdrop-blur-sm border border-zinc-600/50',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size,
  variant,
  closeButton = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  const handleClose = () => {
    onClose();
  };

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      handleClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={modalVariants({ size, variant, className })}>
                {/* Header */}
                {(title || closeButton) && (
                  <Box className="flex items-center justify-between p-6 pb-4">
                    <Box>
                      {title && (
                        <Dialog.Title as="h3" className="text-lg font-semibold text-zinc-200">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-1 text-sm text-zinc-300">
                          {description}
                        </Dialog.Description>
                      )}
                    </Box>
                    {closeButton && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="ml-4 p-2"
                        aria-label="閉じる"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </Button>
                    )}
                  </Box>
                )}

                {/* Content */}
                {children && (
                  <Box
                    className={`px-6 ${title || closeButton ? '' : 'pt-6'} ${footer ? 'pb-4' : 'pb-6'}`}
                  >
                    <div className="text-zinc-200">{children}</div>
                  </Box>
                )}

                {/* Footer */}
                {footer && <Box className="px-6 pb-6 pt-4 border-t border-zinc-600">{footer}</Box>}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Pre-configured modal variants
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  variant = 'default',
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <Box className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </Box>
      }
    >
      <p className="text-sm">{message}</p>
    </Modal>
  );
}
