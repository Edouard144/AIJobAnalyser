import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Label } from './Label';

export interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error && <p className="text-[10px] text-destructive mt-1">{error}</p>}
      {hint && !error && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

// Compound component pattern for complex forms
export interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}
