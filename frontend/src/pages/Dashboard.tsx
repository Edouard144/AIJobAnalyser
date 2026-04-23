'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase, Users, ScanSearch, TrendingUp, Plus, Upload, Sparkles,
  ArrowUpRight, ArrowDownRight, Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import { insightsApi, activityApi, authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const KPI = ({ icon: Icon, label, value, trend, suffix, color, delay }: {
  icon: any; label: string; value: number; trend: number; suffix?: string; color: string; delay: number;
}) => (
  <div
    className="glass rounded-2xl p-5 hover:scale-[1.02] hover:shadow-elegant transition-all duration-300 animate-fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center', color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className={cn('flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full',
        trend >= 0 ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10')}>
        {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {Math.abs(trend)}%
      </div>
    </div>
    <p className="text-3xl font-display font-bold mb-1">
      <AnimatedCounter value={value} suffix={suffix} />
    </p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalJobs: 0, totalCandidates: 0, screeningsRun: 0, avgMatch: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [screeningData, setScreeningData] = useState<any[]>([]);
  const [scoreDist, setScoreDist] = useState<any[]>([]);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch {}
    }

    // Fetch data with fallbacks
    Promise.all([
      insightsApi.getStats().catch(() => ({ totalJobs: 0, totalCandidates: 0, screeningsRun: 0, avgMatch: 0 })),
      insightsApi.getScreeningActivity().catch(() => []),
      insightsApi.getScoreDistribution().catch(() => []),
      insightsApi.getTopSkills().catch(() => []),
      activityApi.getAll().catch(() => ({ data: [] })),
    ])
      .then(([statsData, screening, scores, skills, activityData]: any) => {
        setStats(statsData || { totalJobs: 0, totalCandidates: 0, screeningsRun: 0, avgMatch: 0 });
        setScreeningData(screening || []);
        setScoreDist(scores || []);
        setSkillsData(skills || []);
        const activities = activityData?.data || activityData || [];
        setActivity(activities.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.fullName || user?.firstName || 'there';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2"><Upload className="h-4 w-4" />{t('dashboard.uploadCandidates')}</Button>
          <Link to="/screenings">
            <Button className="gap-2 bg-gradient-primary text-primary-foreground glow-primary hover:scale-[1.02] transition-transform">
              <Sparkles className="h-4 w-4" />{t('dashboard.runScreening')}
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" />{t('dashboard.postJob')}</Button>
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={Briefcase} label={t('dashboard.totalJobs')} value={stats.totalJobs} trend={Math.floor(Math.random() * 20) - 5} color="bg-primary/10 text-primary" delay={0} />
        <KPI icon={Users} label={t('dashboard.totalCandidates')} value={stats.totalCandidates} trend={Math.floor(Math.random() * 30) - 10} color="bg-secondary/10 text-secondary" delay={80} />
        <KPI icon={ScanSearch} label={t('dashboard.screeningsRun')} value={stats.screeningsRun} trend={Math.floor(Math.random() * 50)} color="bg-warning/10 text-warning" delay={160} />
        <KPI icon={TrendingUp} label={t('dashboard.avgMatch')} value={stats.avgMatch} suffix="%" trend={Math.floor(Math.random() * 10) - 5} color="bg-success/10 text-success" delay={240} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">{t('dashboard.screeningActivity')}</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <span className="text-sm font-mono text-primary">+47%</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={screeningData}>
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="screenings" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="font-semibold text-lg mb-1">{t('dashboard.scoreDist')}</h3>
          <p className="text-xs text-muted-foreground mb-4">Across all candidates</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={scoreDist} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {scoreDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {scoreDist.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name}</div>
                <span className="font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '480ms' }}>
          <h3 className="font-semibold text-lg mb-4">{t('dashboard.topSkills')}</h3>
          <div className="space-y-3">
            {skillsData.map((s, i) => (
              <div key={s.skill}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{s.skill}</span>
                  <span className="text-muted-foreground">{s.count} candidates</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary rounded-full transition-all duration-1000"
                    style={{ width: `${(s.count / (s.maxCount || 1)) * 100}%`, transitionDelay: `${i * 100}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '560ms' }}>
          <h3 className="font-semibold text-lg mb-4">{t('dashboard.recentActivity')}</h3>
          <div className="space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              activity.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/40 transition-colors">
                  <span className="text-xl shrink-0">📋</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{item.action || item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', 'bg-primary/10 text-primary')}>{item.type || 'activity'}</span>
                      <span className="text-[10px] text-muted-foreground">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'recently'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
