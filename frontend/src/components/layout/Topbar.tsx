import { useEffect, useState } from 'react';
import { Bell, Search, Command, CheckCircle2, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      case 'screening': return <Sparkles className="h-4 w-4 text-primary" />;
      case 'candidate': return <Users className="h-4 w-4 text-secondary" />;
      case 'job': return <CheckCircle2 className="h-4 w-4 text-success" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 md:px-6 gap-4">
        <button
          onClick={onOpenCommand}
          className="flex-1 max-w-md flex items-center gap-3 px-4 h-10 rounded-lg border border-border bg-muted/40 hover:bg-muted text-sm text-muted-foreground transition-colors group"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search jobs, candidates, actions...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="ml-auto hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className={cn('h-5 w-5', shake && 'animate-shake')} />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary glow-primary">
                    <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 p-0 animate-scale-in">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <p className="font-semibold">Notifications</p>
                  <p className="text-xs text-muted-foreground">{unread} unread</p>
                </div>
                <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
                  Mark all read
                </Button>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n: any) => (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer border-l-2 transition-colors',
                        !n.read ? 'border-primary bg-accent/20' : 'border-transparent'
                      )}
                    >
                      <span className="text-lg shrink-0">{getIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{n.title || n.message}</p>
                        <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
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