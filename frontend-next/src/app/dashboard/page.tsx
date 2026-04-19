'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Briefcase, Users, Zap, MapPin, Clock, User } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchJobs } from '@/store/slices/jobsSlice';

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    // If value is 0, just set display to 0 once and return.
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const duration = 800;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>{display}</span>;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user, isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { jobs, loading: jobsLoading } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchJobs());
    }
  }, [dispatch, isAuthenticated]);

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCandidates = jobs.reduce((sum, j) => sum + j.candidates.length, 0);
  const screeningsRun = jobs.filter(j => j.results.length > 0).length;

  const stats = [
    { label: t('dashboard.total_jobs'), value: jobs.length, icon: Briefcase },
    { label: t('dashboard.total_candidates'), value: totalCandidates, icon: Users },
    { label: t('dashboard.screenings_run'), value: screeningsRun, icon: Zap },
  ];

  const statusColors: Record<string, string> = {
    open: 'bg-primary/10 text-primary',
    screening: 'bg-warning/10 text-warning',
    closed: 'bg-destructive/10 text-destructive',
  };

  const daysAgo = (date: string) => {
    if (!mounted) return '...';
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    return days === 0 ? 'Today' : t('dashboard.days_ago', { count: days });
  };

  if (authLoading || (jobsLoading && !mounted)) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{mounted ? t('common.loading') : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <button
            onClick={() => router.push('/jobs/create')}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity btn-press"
          >
            {t('dashboard.new_job')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 shadow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <s.icon className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-3xl font-bold text-foreground animate-count-up">
                <AnimatedNumber value={s.value} />
              </p>
            </motion.div>
          ))}
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">{t('dashboard.empty_title')}</h2>
            <p className="text-muted-foreground mb-6">{t('dashboard.empty_desc')}</p>
            <button
              onClick={() => router.push('/jobs/create')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm btn-press"
            >
              {t('dashboard.new_job')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="bg-card border border-border rounded-xl p-6 shadow-card cursor-pointer group hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 hover:border-l-primary hover:border-l-2"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[job.status]}`}>
                    {t(`job.status_${job.status}`)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                  <span>{job.experience}yr+</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skills.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{s}</span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                      {t('dashboard.more_skills', { count: job.skills.length - 3 })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {job.candidates.length} {t('dashboard.candidates')}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {daysAgo(job.createdAt)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}