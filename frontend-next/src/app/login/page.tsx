'use client';

import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Crosshair } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent } from '@/components/ui/Card';

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await dispatch(loginAction({ email, password })).unwrap();
      toast.success(t('common.success'));
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-card items-center justify-center p-12 border-r border-border">
        <div className="max-w-md text-center">
          <Crosshair className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Scout</h2>
          <p className="text-lg text-muted-foreground">{t('auth.tagline')}</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 pt-24">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 space-y-6">
            <h1 className="text-3xl font-bold text-foreground">{t('auth.login')}</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  error={errors.email}
                />
              </div>

              <div>
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="hover:text-foreground transition-colors"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />
              </div>

              <Button type="submit" loading={loading} fullWidth>
                {loading ? t('common.loading') : t('auth.sign_in')}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center">
              {t('auth.no_account')}{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                {t('auth.sign_up')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}