import { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from '@/components/CommandPalette';
import { AIChatBubble } from '@/components/AIChatBubble';
import { Outlet, useLocation } from 'react-router-dom';

export const AppLayout = ({ children }: { children?: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-[#080808] text-white">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenCommand={() => setPaletteOpen(true)} />
        <main
          key={location.pathname}
          className="flex-1 p-6 md:p-8 animate-fade-in-up overflow-auto"
        >
          {children || <Outlet />}
        </main>
      </div>
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
      <AIChatBubble />
    </div>
  );
};
