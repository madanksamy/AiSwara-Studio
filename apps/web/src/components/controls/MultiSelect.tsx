'use client';

import { useState, useRef, useEffect } from 'react';

interface MultiSelectOption {
  value: string;
  label: string;
  category?: string;
}

interface MultiSelectProps {
  label: string;
  values: string[];
  options: MultiSelectOption[];
  onChange: (values: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
}

export function MultiSelect({
  label,
  values,
  options,
  onChange,
  maxSelections = Infinity,
  placeholder = 'Select items...',
  className = '',
  disabled = false,
  searchable = true,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter((opt) => values.includes(opt.value));

  const filteredOptions = search
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Group options by category
  const groupedOptions = filteredOptions.reduce((acc, opt) => {
    const category = opt.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(opt);
    return acc;
  }, {} as Record<string, MultiSelectOption[]>);

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

  const toggleOption = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter((v) => v !== optionValue));
    } else if (values.length < maxSelections) {
      onChange([...values, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter((v) => v !== optionValue));
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`} ref={containerRef}>
      <div className="flex justify-between items-center">
        <label className="text-zinc-300 text-sm font-medium">{label}</label>
        {maxSelections !== Infinity && (
          <span className="text-xs text-zinc-500">
            {values.length}/{maxSelections}
          </span>
        )}
      </div>

      <div className="relative">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`min-h-[42px] px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg cursor-pointer transition-colors ${
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-zinc-600'
          } ${isOpen ? 'border-purple-500' : ''}`}
        >
          {selectedOptions.length === 0 ? (
            <span className="text-zinc-500 text-sm">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-600/30 text-purple-200 rounded text-xs"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => removeOption(opt.value, e)}
                    className="hover:text-white"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-72 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-zinc-700 sticky top-0 bg-zinc-900">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-600 rounded text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>
            )}

            {Object.keys(groupedOptions).length === 0 ? (
              <div className="px-3 py-2 text-sm text-zinc-500">No options</div>
            ) : (
              Object.entries(groupedOptions).map(([category, opts]) => (
                <div key={category}>
                  <div className="px-3 py-1.5 text-xs font-medium text-zinc-500 bg-zinc-800/50 sticky top-12">
                    {category}
                  </div>
                  {opts.map((option) => {
                    const isSelected = values.includes(option.value);
                    const isDisabled = !isSelected && values.length >= maxSelections;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => toggleOption(option.value)}
                        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                          isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-zinc-800'
                        } ${isSelected ? 'bg-purple-600/20' : ''}`}
                      >
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-zinc-600'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className={isSelected ? 'text-purple-200' : 'text-zinc-100'}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiSelect;
