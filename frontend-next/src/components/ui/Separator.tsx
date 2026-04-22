import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          'shrink-0 border-border',
          orientation === 'horizontal' ? 'w-full border-t' : 'h-full border-l',
          className
        )}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';
