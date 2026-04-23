import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await authApi.register(formData.firstName, formData.lastName, formData.email, formData.password);
      // Save email for OTP verification
      sessionStorage.setItem('pendingVerificationEmail', formData.email);
      toast.success('Account created! Check your email for verification code.');
      navigate('/verify');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass rounded-2xl p-8 shadow-elegant">
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold mb-2">{t('auth.createAccount')}</h1>
            <p className="text-muted-foreground text-sm">Start screening candidates in 2 minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('auth.firstName')}</Label>
                <Input 
                  name="firstName"
                  placeholder="Jordan" 
                  className="h-11" 
                  required 
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('auth.lastName')}</Label>
                <Input 
                  name="lastName"
                  placeholder="Devos" 
                  className="h-11" 
                  required 
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('auth.email')}</Label>
              <Input 
                name="email"
                type="email" 
                placeholder="you@company.com" 
                className="h-11" 
                required 
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('auth.password')}</Label>
              <Input 
                name="password"
                type="password" 
                placeholder="••••••••" 
                className="h-11" 
                required 
                minLength={6}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('auth.confirmPassword')}</Label>
              <Input 
                name="confirmPassword"
                type="password" 
                placeholder="••••••••" 
                className="h-11" 
                required 
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit" 
              disabled={loading}
              className="w-full h-11 bg-gradient-primary text-primary-foreground font-semibold group glow-primary hover:scale-[1.02] transition-transform mt-2"
            >
              {loading ? 'Creating account...' : t('auth.register')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}