'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Crosshair, Sun, Moon, ChevronDown, LogOut } from 'lucide-react';
import { logout as logoutAction } from '@/store/slices/authSlice';
import type { RootState, AppDispatch } from '@/store';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

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
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-xl'
          : 'bg-background/95'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <Crosshair className="h-6 w-6 text-primary transition-transform group-hover:rotate-45" />
          <span className="text-xl font-bold text-foreground">Scout</span>
        </Link>

        {navLinks.length > 0 && (
          <div className="hidden sm:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors pb-0.5 border-b-2 ${
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

        <div className="flex items-center gap-3">
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors active:scale-95"
            >
              <span>{mounted ? currentLang.flag : '🌐'}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-elevated py-1 min-w-[160px] z-dropdown">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-accent transition-colors ${
                      lang.code === i18n.language ? 'text-primary font-medium' : 'text-foreground'
                    }`}
                  >
                    <span>{mounted ? lang.flag : ''}</span> {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggle}
            type="button"
            className="p-2 rounded-md hover:bg-accent transition-colors active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            {mounted && (
              theme === 'light' ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {isAuthenticated && user && (
            <div ref={userRef} className="relative">
              <button
                onClick={() => setUserOpen(!userOpen)}
                type="button"
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold active:scale-95"
              >
                {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-elevated py-2 min-w-[200px] z-dropdown">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user.fullName || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-destructive hover:bg-accent transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}