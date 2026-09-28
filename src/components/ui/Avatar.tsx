import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  statusIndicator?: 'online' | 'offline' | 'busy' | 'suspended';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  name,
  size = 'md',
  statusIndicator,
  className,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-neutral-400',
    busy: 'bg-amber-500',
    suspended: 'bg-rose-500',
  };

  const getInitials = (str?: string) => {
    if (!str) return '';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={cn('relative inline-flex shrink-0', className)} {...props}>
      <div
        className={cn(
          'rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 select-none shadow-sm',
          sizes[size]
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : name ? (
          <span>{getInitials(name)}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-neutral-400" />
        )}
      </div>

      {statusIndicator && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white',
            statusColors[statusIndicator]
          )}
        />
      )}
    </div>
  );
};
