import { memo } from 'react';
import { cn } from '@/lib/utils';
import { avatarGradient, initials } from '@/lib/avatarColor';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

const sizeMap: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
  xs: 'h-6 w-6 text-[8px]',
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-base',
};

export const GradientAvatar = memo(({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: AvatarSize;
  className?: string;
}) => {
  const fontSize = typeof size === 'number' ? Math.max(10, size * 0.35) : undefined;
  const containerSize = typeof size === 'number' ? size : undefined;
  const sizeClass = typeof size === 'number' ? '' : sizeMap[size];
  
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-primary-foreground font-bold shrink-0 overflow-hidden',
        'shadow-[inset_0_1px_0_hsl(0_0%_100%/0.2),inset_0_-1px_0_hsl(0_0%_0%/0.1)]',
        sizeClass,
        className,
      )}
      style={{ 
        backgroundImage: avatarGradient(name),
        width: containerSize,
        height: containerSize,
        fontSize: fontSize,
        lineHeight: 1,
      }}
      aria-label={name}
    >
      <span className="truncate px-1">{initials(name)}</span>
    </div>
  );
});