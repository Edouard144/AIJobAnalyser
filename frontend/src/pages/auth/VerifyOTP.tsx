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
      <div className="w-full max-w-lg lg:max-w-xl animate-fade-in-up">
        {/* Transparent Tech Card */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 lg:p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-center">
          <div className="mb-8">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 mb-4 block font-sans">Verification Protocol</span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-3">
              Access <span className="text-white/20">Code.</span>
            </h1>
            <p className="text-[13px] text-white/40 font-medium">Verify your identity to authorize the session.</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mt-4 flex items-center justify-center gap-2">
              <Mail className="h-2.5 w-2.5" />
              {email || 'PENDING_IDENTITY'}
            </p>
          </div>

          <div className="flex justify-center gap-2.5 mb-8" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => (refs.current[i] = el)}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                maxLength={1}
                className="h-14 w-11 sm:w-12 text-center text-xl font-black rounded-xl border border-white/5 bg-white/5 text-white focus:border-white/20 focus:outline-none transition-all"
              />
            ))}
          </div>

          <Button
            onClick={() => submit()} 
            disabled={loading || code.some(d => !d)}
            className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/90 transition-all shadow-glow rounded-xl"
          >
            {loading ? 'Authorizing...' : t('auth.verify')}
          </Button>

          <div className="mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
            Internal Delay?{' '}
            {countdown > 0 ? (
              <span>Retry in {countdown}s</span>
            ) : (
              <button onClick={resend} className="text-white hover:underline underline-offset-[4px] decoration-white/20 transition-all uppercase">{t('auth.resend')}</button>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}