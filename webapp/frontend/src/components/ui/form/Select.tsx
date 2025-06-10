'use client';

import React, { Fragment, useId } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { Box } from '../layout/Box';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  label,
  placeholder = '選択してください',
  error,
  helperText,
  disabled = false,
  className = '',
}: SelectProps) {
  const selectedOption = options.find(option => option.value === value);
  const generatedId = useId();
  const selectId = `select-${generatedId}`;

  return (
    <Box className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <Box className="relative">
          <Listbox.Button
            id={selectId}
            className={`
              relative w-full cursor-pointer rounded-lg bg-gray-800 py-2 pl-3 pr-10 text-left text-sm
              shadow-sm transition-all duration-200
              ${error ? 'border border-red-600 focus:border-red-500 focus:ring-red-500' : 'border border-gray-600 focus:border-gray-500 focus:ring-gray-500'}
              focus:outline-none focus:ring-2
              ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          >
            <span className={`block truncate ${selectedOption ? 'text-gray-300' : 'text-gray-500'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options 
              className="absolute z-[100] mt-1 max-h-60 w-full overflow-y-auto rounded-lg bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-gray-700 focus:outline-none scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
              static
              modal={false}
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-gray-700 text-white' : 'text-gray-300'
                    } ${option.disabled ? 'cursor-not-allowed opacity-50' : ''}`
                  }
                  value={option.value}
                  disabled={option.disabled}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.label}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Box>
      </Listbox>
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="mt-1 text-xs text-gray-400">
          {helperText}
        </p>
      )}
    </Box>
  );
}