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
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenCommand={() => setPaletteOpen(true)} />
        <main key={location.pathname} className="flex-1 p-4 md:p-8 animate-fade-in-up">
          {children || <Outlet />}
        </main>
      </div>
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
      <AIChatBubble />
    </div>
  );
};
