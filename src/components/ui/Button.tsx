import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40 disabled:opacity-50 disabled:pointer-events-none select-none rounded-lg active:scale-[0.98]';

    const variants = {
      primary:
        'bg-brand-black text-white hover:bg-neutral-800 shadow-sm border border-neutral-800',
      secondary:
        'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200',
      outline:
        'bg-transparent text-neutral-900 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400',
      ghost:
        'bg-transparent text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 border border-rose-700 shadow-sm',
      accent:
        'bg-brand-pink text-white hover:bg-brand-pink/90 shadow-sm shadow-brand-pink/20',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
