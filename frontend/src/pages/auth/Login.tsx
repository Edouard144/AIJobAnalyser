import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = await authApi.login(email, password);
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken || '');
      
      let user = res.user;
      if (!user) {
        user = await authApi.getMe() as any;
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Transparent Tech Card */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 lg:p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <div className="mb-6">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 mb-4 block font-sans">Authorized Access</span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-2">
              System <span className="text-white/20">Login.</span>
            </h1>
            <p className="text-[13px] text-white/40 font-medium">Precision candidate screening for the next generation of talent.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 ml-4 font-sans">Identity</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@enterprise.com" 
                className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:border-white/20 px-5 rounded-xl transition-all" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-4">
                <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 font-sans">Security Key</Label>
                <Link to="/forgot-password" className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/10 focus:border-white/20 px-5 rounded-xl transition-all" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="text-[10px] font-bold text-white uppercase tracking-[0.1em] bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/90 transition-all shadow-glow mt-2 rounded-xl"
              disabled={loading}
            >
              {loading ? 'Authorizing...' : 'Log in'}
            </Button>

            <div className="relative flex items-center py-4">
            </div>

            
          </form>

          <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-8 mb-0">
            Internal Access Only /{' '}
            <Link to="/register" className="text-white hover:underline underline-offset-[4px] decoration-white/20 transition-all font-sans">Sign up</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
