'use client';

import { useCallback, useRef, useState } from 'react';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  unit?: string;
  className?: string;
  disabled?: boolean;
}

const SIZES = {
  sm: { knob: 40, stroke: 3, fontSize: 'text-xs' },
  md: { knob: 56, stroke: 4, fontSize: 'text-sm' },
  lg: { knob: 72, stroke: 5, fontSize: 'text-base' },
};

export function Knob({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  size = 'md',
  showValue = true,
  unit = '',
  className = '',
  disabled = false,
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(value);

  const { knob: knobSize, stroke, fontSize } = SIZES[size];
  const radius = (knobSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // Knob rotation: 270 degrees (from -135 to +135)
  const percentage = (value - min) / (max - min);
  const rotation = -135 + percentage * 270;
  const strokeDashoffset = circumference * (1 - percentage * 0.75);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);
      startY.current = e.clientY;
      startValue.current = value;
    },
    [disabled, value]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || disabled) return;
      const deltaY = startY.current - e.clientY;
      const range = max - min;
      const sensitivity = 150; // pixels for full range
      const deltaValue = (deltaY / sensitivity) * range;
      const rawValue = startValue.current + deltaValue;
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      onChange(clampedValue);
    },
    [isDragging, disabled, min, max, step, onChange]
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
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        ref={knobRef}
        className={`relative cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{ width: knobSize, height: knobSize }}
        onMouseDown={handleMouseDown}
      >
        {/* Background circle */}
        <svg
          className="absolute inset-0"
          viewBox={`0 0 ${knobSize} ${knobSize}`}
        >
          <circle
            cx={knobSize / 2}
            cy={knobSize / 2}
            r={radius}
            fill="none"
            stroke="#27272a"
            strokeWidth={stroke}
            strokeDasharray={circumference * 0.75}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(135 ${knobSize / 2} ${knobSize / 2})`}
          />
          {/* Active arc */}
          <circle
            cx={knobSize / 2}
            cy={knobSize / 2}
            r={radius}
            fill="none"
            stroke="url(#knobGradient)"
            strokeWidth={stroke}
            strokeDasharray={circumference * 0.75}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(135 ${knobSize / 2} ${knobSize / 2})`}
          />
          <defs>
            <linearGradient id="knobGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        {/* Knob body */}
        <div
          className={`absolute inset-2 bg-zinc-900 rounded-full shadow-lg border border-zinc-700 transition-transform ${
            isDragging ? 'scale-95' : ''
          }`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Indicator line */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-white rounded-full" />
        </div>
      </div>
      {showValue && (
        <span className={`text-zinc-400 font-mono ${fontSize}`}>
          {value}{unit}
        </span>
      )}
      <span className="text-zinc-300 text-xs font-medium text-center">
        {label}
      </span>
    </div>
  );
}

export default Knob;
