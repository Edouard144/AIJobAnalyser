import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, ScanSearch, BarChart3, Sparkles, Activity,
  UserCircle, UsersRound, CreditCard, HelpCircle, ChevronLeft, Menu,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { clearAuth } from '@/lib/api';

export const Sidebar = ({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (b: boolean) => void }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }
  }, []);

  const getInitials = () => {
    if (!user) return 'JD';
    const name = user.fullName || user.firstName || '';
    if (!name) return user.email?.[0]?.toUpperCase() || 'JD';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'JD';
  };

  const getName = () => {
    if (!user) return 'User';
    return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
  };

  const sections = [
    {
      label: t('nav.main'),
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
        { to: '/jobs', icon: Briefcase, label: t('nav.jobs') },
        { to: '/candidates', icon: Users, label: t('nav.candidates') },
        { to: '/screenings', icon: ScanSearch, label: t('nav.screenings') },
      ],
    },
    {
      label: t('nav.analytics'),
      items: [
        { to: '/reports', icon: BarChart3, label: t('nav.reports') },
        { to: '/insights', icon: Sparkles, label: t('nav.insights') },
        { to: '/ai-activity', icon: Activity, label: t('nav.aiActivity') },
      ],
    },
    {
      label: t('nav.settings'),
      items: [
        { to: '/account', icon: UserCircle, label: t('nav.account') },
        { to: '/team', icon: UsersRound, label: t('nav.team') },
        { to: '/billing', icon: CreditCard, label: t('nav.billing') },
        { to: '/help', icon: HelpCircle, label: t('nav.help') },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen flex-shrink-0 border-r border-border bg-sidebar transition-all duration-300 ease-out z-30',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 glow-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg tracking-tight whitespace-nowrap">
              AI<span className="text-gradient">RECRUIT</span>
            </span>
          )}
        </div>
        <Button
          variant="ghost" size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('h-7 w-7 shrink-0', collapsed && 'absolute right-2')}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      <nav className="p-3 space-y-6 overflow-y-auto h-[calc(100vh-64px-72px)] scrollbar-hide">
        {sections.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground/70">{section.label}</p>
            )}
            <ul className="space-y-1">
              {section.items.map(item => {
                const active = location.pathname === item.to;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        active
                          ? 'bg-accent text-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary glow-primary" />
                      )}
                      <item.icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-primary')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

<div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border bg-sidebar space-y-1">
        <div className={cn('flex items-center gap-3 rounded-lg p-2', !collapsed && 'hover:bg-sidebar-accent cursor-pointer')}>
          <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
            {getInitials()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{getName()}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.plan || 'Recruiter'}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => { clearAuth(); window.location.href = '/login'; }}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
            !collapsed && 'px-3', collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span className="font-medium">Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

export const MobileSidebarTrigger = ({ onClick }: { onClick: () => void }) => (
  <Button variant="ghost" size="icon" className="md:hidden" onClick={onClick}>
    <Menu className="h-5 w-5" />
  </Button>
);
