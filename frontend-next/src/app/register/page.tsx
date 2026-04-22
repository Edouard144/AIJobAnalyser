'use client';

import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crosshair, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { register as registerAction } from '@/store/slices/authSlice';
import type { AppDispatch } from '@/store';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
    if (!firstName) e.firstName = 'Required';
    if (!lastName) e.lastName = 'Required';
    if (!email) e.email = 'Required';
    if (!password) e.password = 'Required';
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
      {/* Left Side - Content/Marketing (Brand Side) */}
      <motion.div
        initial={{ x: 0 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-primary/80 relative overflow-hidden"
      >
        {/* Decorative */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Crosshair className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Scout</span>
        </div>

        {/* Centered Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Create your account</h1>
            <p className="text-white/80 text-lg">Start finding the best candidates with AI-powered screening</p>

            {/* Switch to Login */}
            <div className="mt-12 p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <p className="text-white/80 mb-4">Already have an account?</p>
              <Link href="/login">
                <Button 
                  variant="outline" 
                  className="w-full border-white/40 text-white hover:bg-white hover:text-primary"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Action Zone (Form) */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Crosshair className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">Scout</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">Get started</h2>
          <p className="text-sm text-muted-foreground mb-8">Enter your details to create your account</p>

          {/* Social Login - Circular */}
          <div className="flex items-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.63l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.71 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.71 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.48 5.922.42.364.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </motion.button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center mb-8">
            <div className="flex-1 h-px bg-border" />
            <span className="px-4 text-xs text-muted-foreground">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="pl-10 h-12 bg-muted/30 rounded-lg border-border"
                  error={errors.firstName}
                />
              </div>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="h-12 bg-muted/30 rounded-lg border-border"
                  error={errors.lastName}
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="pl-10 h-12 bg-muted/30 rounded-lg border-border"
                error={errors.email}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="pl-10 h-12 bg-muted/30 rounded-lg border-border"
                error={errors.password}
              />
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>

            {/* Submit */}
            <Button 
              type="submit" 
              loading={loading} 
              fullWidth
              size="lg"
              className="h-12 rounded-lg font-semibold"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          {/* Mobile: Switch to Login */}
          <p className="mt-8 text-center text-sm text-muted-foreground lg:hidden">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}