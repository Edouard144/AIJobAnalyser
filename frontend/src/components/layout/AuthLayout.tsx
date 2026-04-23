import { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';

export const AuthLayout = ({ children, side }: { children: ReactNode; side?: ReactNode }) => {
  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/30" />

      {/* Floating orbs */}
      <div className="orb h-[600px] w-[600px] bg-primary/30 -top-48 -left-48" />
      <div className="orb h-[500px] w-[500px] bg-primary-glow/25 top-1/3 -right-40" style={{ animationDelay: '4s' }} />
      <div className="orb h-[400px] w-[400px] bg-primary/20 -bottom-32 left-1/4" style={{ animationDelay: '8s' }} />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      {/* Top controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Brand */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-lg tracking-tight">
          AI<span className="text-gradient">RECRUIT</span>
        </span>
      </div>

      {side && (
        <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          {side}
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        {children}
      </div>
    </div>
  );
};
