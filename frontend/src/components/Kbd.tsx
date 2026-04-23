import { cn } from '@/lib/utils';

// Small keyboard-shortcut chip. e.g. <Kbd>⌘</Kbd><Kbd>K</Kbd>
export const Kbd = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <kbd
    className={cn(
      'inline-flex items-center justify-center min-w-[1.4rem] h-5 px-1.5 rounded-md',
      'bg-muted/70 border border-border text-[10px] font-mono font-semibold text-muted-foreground',
      'shadow-[inset_0_-1px_0_hsl(var(--foreground)/0.08)] tabular-nums',
      className,
    )}
  >
    {children}
  </kbd>
);
