'use client';

import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

const codeVariants = cva(
  'font-mono text-sm',
  {
    variants: {
      variant: {
        inline: 'inline-block px-1.5 py-0.5 rounded bg-gray-800 text-blue-300',
        block: 'block w-full p-4 rounded-lg bg-gray-900 text-gray-300 overflow-x-auto',
      },
    },
    defaultVariants: {
      variant: 'inline',
    },
  }
);

export interface CodeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof codeVariants> {
  children?: React.ReactNode;
  language?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
}

const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ 
    className, 
    variant = 'inline', 
    language,
    showLineNumbers = false,
    copyable = false,
    children, 
    ...props 
  }, ref) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      if (typeof children === 'string') {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    if (variant === 'inline') {
      return (
        <code
          ref={ref}
          className={codeVariants({ variant, className })}
          {...props}
        >
          {children}
        </code>
      );
    }

    // Block variant
    const lines = typeof children === 'string' ? children.split('\n') : [children];

    return (
      <div className="relative group">
        {language && (
          <div className="absolute top-2 left-4 text-xs text-gray-500 uppercase">
            {language}
          </div>
        )}
        {copyable && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800"
            aria-label="Copy code"
          >
            {copied ? (
              <CheckIcon className="h-4 w-4 text-green-400" />
            ) : (
              <ClipboardIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
        )}
        <pre
          ref={ref as React.ForwardedRef<HTMLPreElement>}
          className={codeVariants({ variant, className })}
          {...props}
        >
          {showLineNumbers ? (
            <code className="block">
              {lines.map((line, index) => (
                <div key={index} className="table-row">
                  <span className="table-cell pr-4 text-gray-600 text-right select-none">
                    {index + 1}
                  </span>
                  <span className="table-cell">{line}</span>
                </div>
              ))}
            </code>
          ) : (
            <code>{children}</code>
          )}
        </pre>
      </div>
    );
  }
);

Code.displayName = 'Code';

// Inline Code Component
export const InlineCode = React.forwardRef<HTMLElement, Omit<CodeProps, 'variant'>>(
  (props, ref) => <Code ref={ref} variant="inline" {...props} />
);
InlineCode.displayName = 'InlineCode';

// Code Block Component
export interface CodeBlockProps extends Omit<CodeProps, 'variant'> {
  title?: string;
  theme?: 'dark' | 'light';
}

export const CodeBlock = React.forwardRef<HTMLElement, CodeBlockProps>(
  ({ 
    title, 
    theme = 'dark',
    className,
    children,
    ...props 
  }, ref) => {
    const themeClass = theme === 'light' 
      ? 'bg-gray-100 text-gray-800 border-gray-300' 
      : 'bg-gray-900 text-gray-300 border-gray-700';

    return (
      <div className={`rounded-lg border ${themeClass} ${className || ''}`}>
        {title && (
          <div className={`px-4 py-2 border-b ${theme === 'light' ? 'border-gray-300' : 'border-gray-700'}`}>
            <h4 className="text-sm font-medium">{title}</h4>
          </div>
        )}
        <Code
          ref={ref}
          variant="block"
          className="rounded-none border-0"
          {...props}
        >
          {children}
        </Code>
      </div>
    );
  }
);
CodeBlock.displayName = 'CodeBlock';

// Keyboard Key Component
export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-gray-800 border border-gray-700 rounded text-gray-300 ${className || ''}`}
        {...props}
      >
        {children}
      </kbd>
    );
  }
);
Kbd.displayName = 'Kbd';

// Variable Component
export interface VarProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Var = React.forwardRef<HTMLElement, VarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <var
        ref={ref}
        className={`font-mono text-sm text-purple-400 not-italic ${className || ''}`}
        {...props}
      >
        {children}
      </var>
    );
  }
);
Var.displayName = 'Var';

export { Code, codeVariants };