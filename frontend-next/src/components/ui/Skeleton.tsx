import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  ...props
}: SkeletonProps) {
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: width ?? (variant === 'circular' ? '2rem' : '100%'),
    height: height ?? (variant === 'circular' ? '2rem' : '1rem'),
  };

  return (
    <div
      className={cn('bg-muted animate-pulse', variants[variant], className)}
      style={style}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-4/5' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-6 space-y-4', className)}>
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="85%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="bg-muted/50 px-6 py-3 border-b border-border">
        <Skeleton variant="text" height="1rem" width="30%" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4">
            <Skeleton variant="circular" width="2rem" height="2rem" />
            <div className="flex-1 space-y-1.5">
              <Skeleton variant="text" width="25%" />
              <Skeleton variant="text" width="50%" />
            </div>
            <Skeleton variant="text" width="15%" />
          </div>
        ))}
      </div>
    </div>
  );
}
