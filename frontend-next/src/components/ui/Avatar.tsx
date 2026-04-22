import { type HTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ className, src, alt = '', fallback, size = 'md', ...props }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const showFallback = !src || imageError;

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold overflow-hidden',
        sizes[size],
        className
      )}
      {...props}
    >
      {!showFallback && src && (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
      {showFallback && (
        <span className="select-none">
          {fallback?.charAt(0)?.toUpperCase() || alt?.charAt(0)?.toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
}

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
}

export function AvatarGroup({ className, children, max = 3, ...props }: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visible = childArray.slice(0, max);
  const remaining = Math.max(0, childArray.length - max);

  return (
    <div className={cn('flex -space-x-2', className)} {...props}>
      {visible.map((child, i) => (
        <div key={i} className="ring-2 ring-background rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div className="ring-2 ring-background rounded-full">
          <Avatar size="sm" fallback={`+${remaining}`} className="bg-muted text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

AvatarGroup.displayName = 'AvatarGroup';
