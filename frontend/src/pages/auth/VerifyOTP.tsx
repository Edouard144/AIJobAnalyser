import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

export default function VerifyOTP() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [email, setEmail] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Get email from navigation state or localStorage
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setEmail(stateEmail);
    } else {
      // Try to get from register session
      const savedEmail = sessionStorage.getItem('pendingVerificationEmail');
      if (savedEmail) setEmail(savedEmail);
    }
    
    refs.current[0]?.focus();
    const interval = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [location.state]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code];
    next[i] = v;
    setCode(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
    if (next.every(d => d) && i === 5) submit(next.join(''));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      const digits = text.split('');
      setCode(digits);
      submit(text);
    }
  };

  const submit = async (val?: string) => {
    const otp = val || code.join('');
    if (otp.length !== 6) return;
    if (!email) {
      toast.error('Email not found. Please register again.');
      navigate('/register');
      return;
    }
    
    setLoading(true);
    try {
      const res: any = await authApi.verifyOTP(email, otp);
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken || '');
      
      let user = res.user;
      if (!user) {
        user = await authApi.getMe() as any;
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      sessionStorage.removeItem('pendingVerificationEmail');
      toast.success('Email verified!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) {
      toast.error('Email not found. Please register again.');
      navigate('/register');
      return;
    }
    try {
      await authApi.sendOTP(email);
      toast.success('New code sent!');
      setCountdown(45);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass rounded-2xl p-8 shadow-elegant text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 glow-primary">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>

          <h1 className="text-2xl font-display font-bold mb-2">{t('auth.verifyEmail')}</h1>
          <p className="text-muted-foreground text-sm mb-1">{t('auth.verifySubtitle')}</p>
          <p className="text-sm font-medium flex items-center justify-center gap-1.5 mb-8">
            <Mail className="h-3.5 w-3.5 text-primary" />
            {email || 'your@email.com'}
          </p>

          <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => (refs.current[i] = el)}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                maxLength={1}
                className="h-14 w-11 sm:w-12 text-center text-xl font-display font-bold rounded-xl border-2 border-border bg-background focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
              />
            ))}
          </div>

          <Button
            onClick={() => submit()} 
            disabled={loading || code.some(d => !d)}
            className="w-full h-11 bg-gradient-primary text-primary-foreground font-semibold group glow-primary hover:scale-[1.02] transition-transform"
          >
            {loading ? 'Verifying...' : t('auth.verify')}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>

          <div className="mt-6 text-sm text-muted-foreground">
            Didn't receive it?{' '}
            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <button onClick={resend} className="text-primary font-semibold hover:underline">{t('auth.resend')}</button>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}