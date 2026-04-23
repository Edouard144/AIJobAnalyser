import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LANGUAGES } from '@/lib/i18n';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

export default function Account() {
  const { i18n } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage first
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
    // Then fetch fresh from API
    authApi.getMe()
      .then((u: any) => {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getInitials = () => {
    if (!user) return 'JD';
    const name = user.fullName || user.firstName || '';
    if (!name) return user.email?.[0]?.toUpperCase() || 'JD';
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'JD';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const fullName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const email = user?.email || '';
  
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">Account</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Profile</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl glow-primary">
            {getInitials()}
            <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="font-semibold">{fullName}</p>
            <p className="text-sm text-muted-foreground">Recruiter</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Full name</Label><Input defaultValue={fullName} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" defaultValue={email} disabled /></div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Current password</Label><Input type="password" /></div>
          <div className="space-y-1.5"><Label>New password</Label><Input type="password" /></div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Language preference</h3>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => i18n.changeLanguage(l.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
                i18n.language === l.code ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'
              }`}>
              <span>{l.flag}</span>{l.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast.success('Settings saved!')} className="bg-gradient-primary glow-primary">Save changes</Button>
      </div>
    </div>
  );
}
