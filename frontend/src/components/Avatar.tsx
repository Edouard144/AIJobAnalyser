import { cn } from '@/lib/utils';
import { avatarGradient, initials } from '@/lib/avatarColor';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

const sizeMap: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

function getSizeClass(size: AvatarSize) {
  if (typeof size === 'number') return `w-[${size}px] h-[${size}px]`;
  return sizeMap[size];
}

export const GradientAvatar = ({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: AvatarSize;
  className?: string;
}) => {
  const sizeClass = typeof size === 'number' ? `w-[${size}px] h-[${size}px] text-[${Math.round(size * 0.35)}px]` : sizeMap[size];
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-primary-foreground font-bold shrink-0',
        'shadow-[inset_0_1px_0_hsl(0_0%_100%/0.2),inset_0_-1px_0_hsl(0_0%_0%/0.1)]',
        sizeClass,
        className,
      )}
      style={{ backgroundImage: avatarGradient(name) }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
};
