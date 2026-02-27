'use client';

import { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className = '',
  disabled = false,
  searchable = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable && search
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`} ref={containerRef}>
      <label className="text-zinc-300 text-sm font-medium">{label}</label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 text-left bg-zinc-900 border border-zinc-700 rounded-lg text-sm transition-colors ${
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-zinc-600 focus:border-purple-500 focus:outline-none'
          } ${isOpen ? 'border-purple-500' : ''}`}
        >
          <span className={selectedOption ? 'text-zinc-100' : 'text-zinc-500'}>
            {selectedOption?.label || placeholder}
          </span>
          <svg
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-zinc-700">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-zinc-500">No options</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
                    option.value === value
                      ? 'bg-purple-600/20 text-purple-300'
                      : 'text-zinc-100'
                  }`}
                >
                  <div>{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {option.description}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Select;
