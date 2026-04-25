import { useTranslation } from 'react-i18next';
import { Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LANGUAGES } from '@/lib/i18n';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Account() {
  const { i18n } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) { try { setUser(JSON.parse(savedUser)); } catch {} }
    authApi.getMe()
      .then((u: any) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getInitials = () => {
    if (!user) return 'JD';
    const name = user.fullName || user.firstName || '';
    if (!name) return user.email?.[0]?.toUpperCase() || 'JD';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'JD';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-6 w-6 animate-spin border-2 border-white/20 border-t-white/60 rounded-full" />
    </div>
  );

  const fullName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const email = user?.email || '';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-2">Settings</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
          Account <span className="text-white/20">Profile.</span>
        </h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6 animate-fade-in-up">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Identity</p>
        <div className="flex items-center gap-5">
          <div className="relative h-18 w-18 shrink-0">
            <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white font-black text-xl">
              {getInitials()}
            </div>
            <button className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-[#0d0d0d] border border-white/15 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Camera className="h-3 w-3 text-white/40" />
            </button>
          </div>
          <div>
            <p className="text-base font-black text-white tracking-tight">{fullName}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mt-1">Recruiter · {user?.plan || 'Free'} plan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Full Name</Label>
            <Input defaultValue={fullName} className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus:border-white/20 transition-all" />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Email</Label>
            <Input type="email" defaultValue={email} disabled className="h-11 bg-white/[0.02] border-white/5 text-white/30 rounded-xl cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* Password Card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Security Key</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Current Password</Label>
            <Input type="password" className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-white/20 transition-all" />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">New Password</Label>
            <Input type="password" className="h-11 bg-white/5 border-white/10 text-white rounded-xl focus:border-white/20 transition-all" />
          </div>
        </div>
      </div>

      {/* Language Card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-4 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Language Protocol</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => i18n.changeLanguage(l.code)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.15em] transition-all',
                i18n.language === l.code
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/5 text-white/30 hover:border-white/15 hover:text-white/60'
              )}
            >
              <span>{l.flag}</span>{l.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast.success('Settings saved!')} className="h-11 bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl px-8">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
