'use client';

import { useCallback, useRef, useState } from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  showValue?: boolean;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
  showValue = true,
  className = '',
  disabled = false,
}: SliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      updateValue(e);
    },
    [disabled]
  );

  const updateValue = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!sliderRef.current || disabled) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percent = x / rect.width;
      const rawValue = min + percent * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      onChange(clampedValue);
    },
    [min, max, step, onChange, disabled]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e);
      }
    },
    [isDragging, updateValue]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach global listeners when dragging
  if (typeof window !== 'undefined') {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-zinc-300 font-medium">{label}</span>
        {showValue && (
          <span className="text-zinc-400 font-mono text-xs">
            {value}{unit}
          </span>
        )}
      </div>
      <div
        ref={sliderRef}
        className={`relative h-2 bg-zinc-800 rounded-full cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Track fill */}
        <div
          className="absolute h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${
            isDragging ? 'scale-110' : 'hover:scale-105'
          }`}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}

export default Slider;
