'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase, Users, ScanSearch, TrendingUp, Plus, Upload, Sparkles,
  ArrowUpRight, ArrowDownRight, Loader2, MessageSquare, Bot,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { insightsApi, activityApi, authApi, clearInsightsCache } from '@/lib/api';
import { cn } from '@/lib/utils';

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-muted rounded-lg', className)} />
);

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
      {trend !== 0 && (
        <div className={cn('flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full',
          trend > 0 ? 'text-success/80 bg-success/5' : 'text-destructive/80 bg-destructive/5')}>
          {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-3xl font-display font-bold mb-1">
      <AnimatedCounter value={value} suffix={suffix} />
    </p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold">{payload[0].value} screenings</p>
      </div>
    );
  }
  return null;
};

const ScoreTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-semibold">{data.name}</p>
        <p className="text-xs text-muted-foreground">{data.value} candidates</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalJobs: 0, totalCandidates: 0, screeningsRun: 0, avgMatch: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [screeningData, setScreeningData] = useState<any[]>([]);
  const [scoreDist, setScoreDist] = useState<any[]>([]);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredPie, setHoveredPie] = useState<number | null>(null);
  const [fabPulse, setFabPulse] = useState(false);
  const fabTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Pulse FAB every 12 seconds
    fabTimer.current = setInterval(() => {
      setFabPulse(true);
      setTimeout(() => setFabPulse(false), 600);
    }, 12000);
    return () => { if (fabTimer.current) clearInterval(fabTimer.current); };
  }, []);

  useEffect(() => {
    clearInsightsCache();
    
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch {}
    }

    Promise.all([
      insightsApi.getStats(),
      insightsApi.getScreeningActivity(),
      insightsApi.getScoreDistribution(),
      insightsApi.getTopSkills(),
      activityApi.getAll(),
    ])
      .then(([statsData, screening, scores, skills, activityData]: any) => {
        setStats(statsData || { totalJobs: 0, totalCandidates: 0, screeningsRun: 0, avgMatch: 0 });
        setScreeningData(screening || []);
        setScoreDist(scores || []);
        setSkillsData(skills || []);
        const activities = activityData?.data || activityData || [];
        setActivity(activities.slice(0, 5));
      })
      .catch((err) => console.error('Dashboard data fetch error:', err))
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
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <div className="h-16 w-64 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const isEmpty = stats.totalJobs === 0 && stats.totalCandidates === 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="animate-fade-in-up">
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

      {isEmpty ? (
        <div className="glass rounded-2xl p-12 text-center animate-fade-in-up">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Welcome to AIRECRUIT</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Post your first job to start receiving applications. Our AI will screen and rank candidates automatically.
          </p>
          <Link to="/jobs">
            <Button className="gap-2 bg-gradient-primary">
              <Plus className="h-4 w-4" />Post Your First Job
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI icon={Briefcase} label={t('dashboard.totalJobs')} value={stats.totalJobs} trend={0} color="bg-primary/10 text-primary" delay={0} />
            <KPI icon={Users} label={t('dashboard.totalCandidates')} value={stats.totalCandidates} trend={0} color="bg-secondary/10 text-secondary" delay={80} />
            <KPI icon={ScanSearch} label={t('dashboard.screeningsRun')} value={stats.screeningsRun} trend={0} color="bg-warning/10 text-warning" delay={160} />
            <KPI icon={TrendingUp} label={t('dashboard.avgMatch')} value={stats.avgMatch} suffix="%" trend={0} color="bg-success/10 text-success" delay={240} />
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg">{t('dashboard.screeningActivity')}</h3>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={screeningData} onMouseMove={(e) => setHoveredBar(e?.activeIndex ?? null)} onMouseLeave={() => setHoveredBar(null)}>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="screenings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} animationDuration={600} animationEasing="ease-out">
                    {screeningData.map((entry, index) => (
                      <Cell key={index} fill={hoveredBar === index ? 'hsl(var(--primary) / 0.8)' : 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <h3 className="font-semibold text-lg mb-1">{t('dashboard.scoreDist')}</h3>
              <p className="text-xs text-muted-foreground mb-4">Across all candidates</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={scoreDist} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={3} animationDuration={500} animationEasing="ease-out">
                    {scoreDist.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={entry.color} 
                        style={{ transform: hoveredPie === index ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center', transition: 'transform 150ms ease-out' }}
                        onMouseEnter={() => setHoveredPie(index)}
                        onMouseLeave={() => setHoveredPie(null)}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ScoreTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-[-10px]">
                {scoreDist.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
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
                {skillsData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No skills data yet. Upload candidates to see skills analysis.</p>
                ) : (
                  skillsData.map((s, i) => (
                    <div key={s.skill}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-foreground">{s.skill}</span>
                        <span className="text-muted-foreground">{s.count} candidates</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${(s.count / (s.maxCount || 1)) * 100}%`, transitionDelay: `${i * 100}ms` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '560ms' }}>
              <h3 className="font-semibold text-lg mb-4">{t('dashboard.recentActivity')}</h3>
              <div className="space-y-2">
                {activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No recent activity yet</p>
                ) : (
                  activity.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm">📋</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug truncate">{item.description || item.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">{item.action}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Action Button */}
      <Link
        to="/chat"
        className={cn(
          'fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary shadow-lg flex items-center justify-center text-primary-foreground',
          'hover:scale-105 transition-all duration-200 hover:rotate-3',
          'shadow-[0_4px_20px_rgba(99,102,241,0.4)]',
          fabPulse && 'animate-pulse'
        )}
        style={{ animation: fabPulse ? 'none' : undefined }}
      >
        <Bot className="h-6 w-6" />
      </Link>
    </div>
  );
}
