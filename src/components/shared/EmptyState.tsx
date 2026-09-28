import React from 'react';
import { cn } from '@/lib/utils';
import { FolderSearch } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200/80 shadow-sm flex items-center justify-center text-neutral-400 mb-3.5">
        {icon || <FolderSearch className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-bold text-neutral-900">{title}</h4>
      <p className="mt-1 text-xs text-neutral-500 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
