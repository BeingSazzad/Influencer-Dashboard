import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      error,
      helperText,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-1.5 w-full', wrapperClassName)}>
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            ref={ref}
            className={cn(
              'w-full h-9 pl-3 pr-8 text-xs font-bold bg-white border border-neutral-200 rounded-lg text-neutral-800 outline-none transition-all duration-150',
              'appearance-none cursor-pointer shadow-2xs',
              'focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-neutral-500 font-medium">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
