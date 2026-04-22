import { type HTMLAttributes, type ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, Warning, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  onClose?: () => void;
  icon?: ReactNode;
}

export function Alert({
  className,
  variant = 'default',
  title,
  description,
  onClose,
  icon,
  ...props
}: AlertProps) {
  const variants = {
    default: {
      container: 'bg-card border-border text-foreground',
      icon: <Info className="h-4 w-4" />,
      iconBg: 'bg-primary/10 text-primary',
    },
    success: {
      container: 'bg-success/10 border-success/20 text-success-foreground',
      icon: <CheckCircle className="h-4 w-4" />,
      iconBg: 'bg-success/20 text-success',
    },
    warning: {
      container: 'bg-warning/10 border-warning/20 text-warning-foreground',
      icon: <Warning className="h-4 w-4" />,
      iconBg: 'bg-warning/20 text-warning',
    },
    destructive: {
      container: 'bg-destructive/10 border-destructive/20 text-destructive-foreground',
      icon: <AlertCircle className="h-4 w-4" />,
      iconBg: 'bg-destructive/20 text-destructive',
    },
    info: {
      container: 'bg-info/10 border-info/20 text-info-foreground',
      icon: <Info className="h-4 w-4" />,
      iconBg: 'bg-info/20 text-info',
    },
  };

  const config = variants[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative rounded-lg border px-4 py-3 flex gap-3',
        'has-[>svg]:pl-11 [&>svg+div]:translate-y-[-3px]',
        config.container,
        className
      )}
      {...props}
    >
      <span className={cn('absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center', config.iconBg, 'rounded-full p-1')}>
        {icon || config.icon}
      </span>
      <div className="flex-1">
        {title && <h5 className="font-semibold text-sm">{title}</h5>}
        {description && <p className="text-sm opacity-90 mt-1">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-background/20 transition-colors"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
