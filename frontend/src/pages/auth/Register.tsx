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
      <div className="w-full max-w-lg lg:max-w-xl animate-fade-in-up">
        {/* Transparent Tech Card */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 lg:p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <div className="mb-8">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 mb-4 block font-sans">Access Protocol</span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-3">
              Create <span className="text-white/20">Account.</span>
            </h1>
            <p className="text-[13px] text-white/40 font-medium leading-relaxed">Start screening candidates with unified global standards.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">{t('auth.firstName')}</Label>
                <Input 
                  name="firstName"
                  placeholder="First" 
                  className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:border-white/20 px-5 rounded-xl transition-all" 
                  required 
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">{t('auth.lastName')}</Label>
                <Input 
                  name="lastName"
                  placeholder="Last" 
                  className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:border-white/20 px-5 rounded-xl transition-all" 
                  required 
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">{t('auth.email')}</Label>
              <Input 
                name="email"
                type="email" 
                placeholder="you@enterprise.com" 
                className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:border-white/20 px-5 rounded-xl transition-all" 
                required 
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">{t('auth.password')}</Label>
                <Input 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:border-white/20 px-5 rounded-xl transition-all" 
                  required 
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Confirm</Label>
                <Input 
                  name="confirmPassword"
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:border-white/20 px-5 rounded-xl transition-all" 
                  required 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/90 transition-all shadow-glow mt-4 rounded-xl"
            >
              {loading ? 'Authorizing...' : t('auth.register')}
            </Button>
          </form>

          <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-10 mb-0">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-white hover:underline underline-offset-[4px] decoration-white/20 transition-all">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}