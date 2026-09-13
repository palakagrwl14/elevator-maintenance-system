import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  threshold?: number; // e.g. 60 for 0.6 threshold
  colorClass?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, threshold = 60, colorClass, ...props }, ref) => {
    const isExceeded = value >= threshold;
    const barColor = colorClass
      ? colorClass
      : isExceeded
      ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]'
      : value > threshold * 0.75
      ? 'bg-amber-500'
      : 'bg-emerald-500';

    return (
      <div
        ref={ref}
        className={cn(
          'relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80 border border-slate-700/50',
          className
        )}
        {...props}
      >
        <div
          className={cn('h-full transition-all duration-500 ease-out rounded-full', barColor)}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
