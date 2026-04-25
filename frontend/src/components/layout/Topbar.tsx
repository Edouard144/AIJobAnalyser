import { useEffect, useState } from 'react';
import { Bell, Search, Command, CheckCircle2, Users, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { notificationsApi } from '@/lib/api';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export const Topbar = ({ onOpenCommand }: { onOpenCommand: () => void }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    notificationsApi.getAll()
      .then((res: any) => {
        const data = res?.data || res || [];
        setNotifications(data);
        setUnread(data.filter((n: any) => !n.read).length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (unread > 0) {
      const t = setInterval(() => {
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }, 8000);
      return () => clearInterval(t);
    }
  }, [unread]);

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setUnread(0);
      setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
    } catch {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'screening': return <Sparkles className="h-4 w-4 text-white/60" />;
      case 'candidate': return <Users className="h-4 w-4 text-white/60" />;
      case 'job': return <CheckCircle2 className="h-4 w-4 text-white/60" />;
      default: return <Bell className="h-4 w-4 text-white/40" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 h-14 border-b border-white/5 bg-[#080808]/90 backdrop-blur-xl shrink-0">
      <div className="flex h-full items-center justify-between px-6 gap-4">
        {/* Search */}
        <button
          onClick={onOpenCommand}
          className="flex-1 max-w-sm flex items-center gap-3 px-4 h-9 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-xs text-white/20 hover:text-white/40 transition-all group"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline font-black uppercase tracking-[0.1em] text-[9px]">Search...</span>
          <kbd className="ml-auto hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-mono text-white/20">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative h-9 w-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all">
                <Bell className={cn('h-4 w-4', shake && 'animate-shake')} />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white">
                    <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-50" />
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-96 p-0 bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-scale-in"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Notifications</p>
                  <p className="text-[9px] font-black tracking-[0.2em] text-white/20 uppercase mt-0.5">{unread} unread signals</p>
                </div>
                <button onClick={markAllRead} className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                  Clear all
                </button>
              </div>
              <div className="max-h-[380px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">No signals yet</p>
                  </div>
                ) : (
                  notifications.map((n: any) => (
                    <div
                      key={n.id}
                      onClick={async () => {
                        if (n.read) return;
                        try {
                          await notificationsApi.markAsRead(n.id);
                          setNotifications(notifications.map(notif =>
                            notif.id === n.id ? { ...notif, read: true } : notif
                          ));
                          setUnread(prev => Math.max(0, prev - 1));
                        } catch {}
                      }}
                      className={cn(
                        'flex items-start gap-3 px-5 py-3.5 hover:bg-white/5 cursor-pointer border-l-2 transition-all',
                        !n.read ? 'border-white/30 bg-white/[0.02]' : 'border-transparent'
                      )}
                    >
                      <span className="shrink-0 mt-0.5">{getIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{n.title || n.message}</p>
                        <p className="text-[10px] text-white/30 truncate mt-0.5">{n.description}</p>
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/15 mt-1">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'recently'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};