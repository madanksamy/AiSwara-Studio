'use client';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
  md: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
  lg: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
};

export function Toggle({
  label,
  checked,
  onChange,
  className = '',
  disabled = false,
  size = 'md',
}: ToggleProps) {
  const { track, thumb, translate } = SIZES[size];

  return (
    <label
      className={`flex items-center gap-2 cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative ${track} rounded-full transition-colors duration-200 ${
          checked
            ? 'bg-gradient-to-r from-purple-600 to-pink-500'
            : 'bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 ${thumb} bg-white rounded-full shadow-md transition-transform duration-200 ${
            checked ? translate : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-zinc-300 text-sm font-medium">{label}</span>
    </label>
  );
}

export default Toggle;
