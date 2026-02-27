'use client';

interface CharacterCounterProps {
  current: number;
  min?: number;
  max: number;
  className?: string;
}

export function CharacterCounter({
  current,
  min = 0,
  max,
  className = '',
}: CharacterCounterProps) {
  const percentage = Math.min((current / max) * 100, 100);

  // Determine status based on character count
  const getStatus = () => {
    if (current > max) return 'error';
    if (current >= max * 0.9) return 'warning';
    if (min > 0 && current < min) return 'low';
    return 'ok';
  };

  const status = getStatus();

  const statusColors = {
    ok: {
      bar: 'from-green-500 to-emerald-400',
      text: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    warning: {
      bar: 'from-yellow-500 to-orange-400',
      text: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    error: {
      bar: 'from-red-500 to-rose-400',
      text: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    low: {
      bar: 'from-blue-500 to-cyan-400',
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
  };

  const colors = statusColors[status];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-zinc-400">Character Count</span>
        <span className={`font-mono font-medium ${colors.text}`}>
          {current} / {max}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`absolute h-full bg-gradient-to-r ${colors.bar} transition-all duration-200`}
          style={{ width: `${percentage}%` }}
        />
        {/* Min marker */}
        {min > 0 && (
          <div
            className="absolute h-full w-0.5 bg-zinc-500"
            style={{ left: `${(min / max) * 100}%` }}
          />
        )}
      </div>

      {/* Status messages */}
      <div className="flex justify-between text-xs">
        {min > 0 && (
          <span className={current < min ? 'text-blue-400' : 'text-zinc-600'}>
            Min: {min}
          </span>
        )}
        <span className={`ml-auto ${current > max ? 'text-red-400' : 'text-zinc-600'}`}>
          {current > max ? `${current - max} over limit` : `${max - current} remaining`}
        </span>
      </div>

      {/* Visual indicator */}
      <div
        className={`px-3 py-2 rounded-lg ${colors.bg} border border-current/20`}
      >
        <div className="flex items-center gap-2">
          {status === 'ok' && (
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === 'warning' && (
            <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {status === 'error' && (
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {status === 'low' && (
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className={`text-xs ${colors.text}`}>
            {status === 'ok' && 'Prompt length is good'}
            {status === 'warning' && 'Approaching character limit'}
            {status === 'error' && 'Exceeds maximum character limit'}
            {status === 'low' && 'Below minimum recommended length'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CharacterCounter;
