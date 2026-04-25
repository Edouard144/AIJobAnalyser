import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex font-sans selection:bg-white selection:text-black overflow-hidden relative">
      
      {/* ========== LEFT SIDEBAR (Consistent with Landing) ========== */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 border-r border-white/5 flex flex-col items-center py-8 shrink-0 bg-[#080808] z-50">
        <div className="flex flex-col items-center">
          <Menu className="h-6 w-6 text-white/40 cursor-pointer hover:text-white transition-colors" />
        </div>

        <div className="flex-1 flex flex-col justify-end gap-8 pb-10">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </aside>

      {/* ========== MAIN CONTENT AREA ========== */}
      <main className="flex-1 ml-20 relative flex items-center justify-center min-h-screen px-6 overflow-hidden">
        
        {/* Cinematic Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="/images/hero-moody.png" 
            alt="Moody Background" 
            className="w-full h-full object-cover grayscale brightness-[0.4] scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808] opacity-80" />
          <div className="absolute inset-0 bg-radial-at-c from-white/[0.03] to-transparent" />
        </div>

        {/* Global Brand Mark */}
        <div className="absolute top-12 left-12 z-20">
          <span className="text-xl font-black tracking-[0.2em] uppercase text-white">
            UMU<span className="text-white/40 font-bold">RAVA</span>
          </span>
        </div>

        <div className="relative z-10 w-full max-w-lg">
          {children}
        </div>
      </main>
    </div>
  );
};
