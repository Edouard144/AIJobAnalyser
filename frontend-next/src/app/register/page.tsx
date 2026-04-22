'use client';

import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Crosshair } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { register as registerAction } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent } from '@/components/ui/Card';

export default function Register() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName) e.firstName = 'First name is required';
    if (!lastName) e.lastName = 'Last name is required';
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
      await dispatch(registerAction({ firstName, lastName, email, password })).unwrap();
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
            <h1 className="text-3xl font-bold text-foreground">{t('auth.register')}</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={errors.firstName}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={errors.lastName}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
              </div>

              <div>
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
              </div>

              <Button type="submit" loading={loading} fullWidth>
                {loading ? t('common.loading') : t('auth.sign_up')}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center">
              {t('auth.have_account')}{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                {t('auth.sign_in')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}