'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Sun, Moon, ChevronDown, LogOut, Sparkles } from 'lucide-react';
import { logout as logoutAction } from '@/store/slices/authSlice';
import type { RootState, AppDispatch } from '@/store';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';

const languages = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'rw', flag: '🇷🇼', label: 'Kinyarwanda' },
  { code: 'sw', flag: '🇰🇪', label: 'Kiswahili' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { theme, toggle } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logoutAction());
    router.push('/login');
    setUserOpen(false);
  };

  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      
      // Smart hide/show - hide when scrolling down, show when scrolling up
      if (scrollY > lastScroll && scrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastScroll(scrollY);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [lastScroll]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const navLinks = isAuthenticated
    ? [
        { href: '/dashboard', label: t('nav.dashboard') },
        { href: '/jobs/create', label: t('nav.jobs') },
      ]
    : [];

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Full-width background */}
        <div className={`absolute inset-0 transition-all duration-300 ${
          scrolled
            ? 'border-b border-border/50 bg-background/90 backdrop-blur-xl shadow-sm'
            : 'bg-background/60'
        }`} />
        
        {/* Centered content container */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Crosshair className="h-7 w-7 text-primary transition-transform group-hover:rotate-45" />
              <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary/60 animate-pulse" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Scout</span>
          </Link>

          {navLinks.length > 0 && (
            <div className="hidden sm:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-200 hover:scale-105 pb-0.5 border-b-2 ${
                    pathname.startsWith(link.href)
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent/50 transition-all duration-200 active:scale-95"
              >
                <span className="text-lg">{mounted ? currentLang.flag : '🌐'}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-elevated py-1.5 min-w-[180px] z-dropdown overflow-hidden"
                  >
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-accent/50 transition-colors ${
                          lang.code === i18n.language ? 'text-primary font-medium bg-primary/5' : 'text-foreground'
                        }`}
                      >
                        <span className="text-lg">{mounted ? lang.flag : ''}</span> {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggle}
              type="button"
              className="relative p-2.5 rounded-lg hover:bg-accent/50 transition-all duration-200 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center overflow-hidden"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 0 : 180, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {mounted && (
                  theme === 'dark' 
                    ? <Sun className="h-4 w-4 text-amber-500" />
                    : <Moon className="h-4 w-4 text-indigo-500" />
                )}
              </motion.div>
            </button>

            {!isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push('/login')}
                  className="text-sm font-medium hidden sm:flex hover:bg-accent/50"
                >
                  Sign in
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => router.push('/register')}
                  className="text-sm font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  Get Started
                </Button>
              </div>
            ) : user && (
              <div ref={userRef} className="relative ml-2">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  type="button"
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold active:scale-95 ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                >
                  {((user.fullName || user.email) || 'U').charAt(0).toUpperCase()}
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-elevated py-2 min-w-[220px] z-dropdown overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground">{user.fullName || user.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> {t('nav.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}