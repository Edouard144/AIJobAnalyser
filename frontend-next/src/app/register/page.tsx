'use client';

import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crosshair, Mail, Lock, User, CheckCircle } from 'lucide-react';
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
  const [focused, setFocused] = useState<string | null>(null);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual/Social Proof */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        {/* Animated particles - subtle constellation effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                opacity: Math.random() * 0.5 + 0.2
              }}
              animate={{ 
                y: [null, Math.random() * 100 + '%'],
                opacity: [null, Math.random() * 0.5 + 0.2]
              }}
              transition={{ 
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center p-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md text-center"
          >
            <motion.div 
              className="relative inline-block mb-8"
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Crosshair className="h-20 w-20 text-primary" />
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-4 h-4 rounded-full bg-primary" />
              </motion.div>
            </motion.div>
            
            <h2 className="text-4xl font-bold text-foreground mb-4">Scout</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t('auth.tagline')}
            </p>
            
            {/* Trust indicators */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Free forever</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 pt-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-md"
        >
          {/* Glassmorphism card */}
          <motion.div
            variants={itemVariants}
            className="relative bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-elevated"
          >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative">
              <h1 className="text-3xl font-bold text-foreground mb-2">Create account</h1>
              <p className="text-sm text-muted-foreground mb-8">Start finding your best candidates</p>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-muted/50 hover:bg-muted border border-border transition-all text-sm font-medium text-foreground"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.63l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.71 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.71 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-muted/50 hover:bg-muted border border-border transition-all text-sm font-medium text-foreground"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.48 5.922.42.364.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </motion.button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center py-4">
                <div className="flex-1 border-t border-border" />
                <span className="px-4 text-xs text-muted-foreground">or continue with email</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name - Floating label style */}
                  <div className="relative">
                    <motion.div
                      animate={focused === 'firstName' || firstName ? { y: -8, scale: 0.85 } : {}}
                      className="absolute left-3 top-2 text-xs text-muted-foreground pointer-events-none"
                    >
                      First name
                    </motion.div>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => setFocused('firstName')}
                      onBlur={() => setFocused(null)}
                      className={`h-12 pt-4 bg-background/80 backdrop-blur-sm ${
                        focused === 'firstName' ? 'ring-2 ring-primary/30 border-primary' : ''
                      } ${errors.firstName ? 'border-destructive' : ''}`}
                    />
                  </div>
                  
                  {/* Last Name */}
                  <div className="relative">
                    <motion.div
                      animate={focused === 'lastName' || lastName ? { y: -8, scale: 0.85 } : {}}
                      className="absolute left-3 top-2 text-xs text-muted-foreground pointer-events-none"
                    >
                      Last name
                    </motion.div>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setFocused('lastName')}
                      onBlur={() => setFocused(null)}
                      className={`h-12 pt-4 bg-background/80 backdrop-blur-sm ${
                        focused === 'lastName' ? 'ring-2 ring-primary/30 border-primary' : ''
                      } ${errors.lastName ? 'border-destructive' : ''}`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <motion.div
                    animate={focused === 'email' || email ? { y: -8, scale: 0.85 } : {}}
                    className="absolute left-3 top-2 text-xs text-muted-foreground pointer-events-none"
                  >
                    Email
                  </motion.div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    className={`h-12 pt-4 bg-background/80 backdrop-blur-sm ${
                      focused === 'email' ? 'ring-2 ring-primary/30 border-primary' : ''
                    } ${errors.email ? 'border-destructive' : ''}`}
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <motion.div
                    animate={focused === 'password' || password ? { y: -8, scale: 0.85 } : {}}
                    className="absolute left-3 top-2 text-xs text-muted-foreground pointer-events-none"
                  >
                    Password
                  </motion.div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    className={`h-12 pt-4 bg-background/80 backdrop-blur-sm ${
                      focused === 'password' ? 'ring-2 ring-primary/30 border-primary' : ''
                    } ${errors.password ? 'border-destructive' : ''}`}
                  />
                </div>

                {/* Submit Button with magnetic effect */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    loading={loading} 
                    fullWidth
                    className="h-12 text-base font-semibold shadow-lg shadow-primary/20"
                  >
                    {loading ? t('common.loading') : 'Create account'}
                  </Button>
                </motion.div>
              </form>

              <p className="text-sm text-muted-foreground text-center mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}