import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, ScanSearch, BarChart3, Activity,
  UserCircle, UsersRound, CreditCard, HelpCircle, ChevronLeft, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { clearAuth } from '@/lib/api';

export const Sidebar = ({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (b: boolean) => void }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch {}
    }
  }, []);

  const getInitials = () => {
    if (!user) return 'JD';
    const name = user.fullName || user.firstName || '';
    if (!name) return user.email?.[0]?.toUpperCase() || 'JD';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'JD';
  };

  const getName = () => {
    if (!user) return 'User';
    return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
  };

  const sections = [
    {
      label: 'MAIN',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
        { to: '/jobs', icon: Briefcase, label: t('nav.jobs') },
        { to: '/candidates', icon: Users, label: t('nav.candidates') },
        { to: '/screenings', icon: ScanSearch, label: t('nav.screenings') },
      ],
    },
    {
      label: 'ANALYTICS',
      items: [
        { to: '/reports', icon: BarChart3, label: t('nav.reports') },
        { to: '/insights', icon: Activity, label: t('nav.insights') },
      ],
    },
    {
      label: 'SETTINGS',
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
        'sticky top-0 h-screen flex-shrink-0 flex flex-col bg-[#080808] border-r border-white/5 transition-all duration-300 ease-out z-30',
        collapsed ? 'w-[72px]' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {!collapsed && (
            <span className="text-sm font-black tracking-[0.2em] uppercase text-white whitespace-nowrap">
              UMU<span className="text-white/30">RAVA</span>
            </span>
          )}
          {collapsed && (
            <span className="text-sm font-black tracking-[0.2em] text-white">U</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto scrollbar-hide space-y-8 px-3">
        {sections.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-3 text-[9px] font-black tracking-[0.4em] text-white/20">
                {section.label}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map(item => {
                const active = location.pathname === item.to;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                        collapsed && 'justify-center',
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-white/30 hover:bg-white/5 hover:text-white/70'
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r-full bg-white" />
                      )}
                      <item.icon className={cn('h-[17px] w-[17px] shrink-0 transition-colors', active ? 'text-white' : 'text-white/30 group-hover:text-white/70')} />
                      {!collapsed && (
                        <span className={cn('truncate text-[11px] font-bold tracking-[0.08em] uppercase transition-colors', active ? 'text-white' : 'text-white/40 group-hover:text-white/70')}>
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-white/5 p-3 space-y-1 shrink-0">
        <div className={cn(
          'flex items-center gap-3 rounded-xl p-2.5',
          !collapsed && 'hover:bg-white/5 cursor-pointer transition-all'
        )}>
          <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-black text-xs shrink-0">
            {getInitials()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white truncate">{getName()}</p>
              <p className="text-[9px] font-black tracking-[0.2em] text-white/20 truncate uppercase">{user?.plan || 'Recruiter'}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => { clearAuth(); window.location.href = '/login'; }}
          className={cn(
            'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/20 hover:bg-white/5 hover:text-white/60 transition-all',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-[16px] w-[16px] shrink-0" />
          {!collapsed && (
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">Sign out</span>
          )}
        </button>
      </div>
    </aside>
  );
};
