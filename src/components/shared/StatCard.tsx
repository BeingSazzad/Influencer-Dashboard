import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // e.g. +14.2 or -3.1
  changePeriod?: string; // e.g. "vs last month"
  icon: React.ReactNode;
  accentColor?: 'pink' | 'black' | 'emerald' | 'amber';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changePeriod = 'vs last month',
  icon,
  accentColor = 'black',
  subtitle,
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const iconVariants = {
    black: 'bg-brand-black text-white',
    pink: 'bg-brand-pink/10 text-brand-pink',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <Card hoverEffect className="p-5 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums">
              {value}
            </span>
          </div>
        </div>
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0',
            iconVariants[accentColor]
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {change !== undefined && (
          <span
            className={cn(
              'inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px]',
              isPositive && 'text-emerald-700 bg-emerald-50',
              isNegative && 'text-rose-700 bg-rose-50',
              !isPositive && !isNegative && 'text-neutral-600 bg-neutral-100'
            )}
          >
            {isPositive && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
            {isNegative && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3 mr-0.5" />}
            {Math.abs(change)}%
          </span>
        )}
        <span className="text-neutral-500 text-[11px]">
          {subtitle || changePeriod}
        </span>
      </div>
    </Card>
  );
};
