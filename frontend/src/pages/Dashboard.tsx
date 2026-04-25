'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Briefcase, Users, ScanSearch, TrendingUp, Plus, Upload,
  ArrowUpRight, ArrowDownRight, MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import { insightsApi, activityApi, clearInsightsCache } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Skeleton ────────────────────────────────────────────────────────────────
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-white/5 rounded-2xl', className)} />
);

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KPI = ({ icon: Icon, label, value, trend, suffix, delay }: {
  icon: any; label: string; value: number; trend: number; suffix?: string; delay: number;
}) => (
  <div
    className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 animate-fade-in-up group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between mb-5">
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
        <Icon className="h-4 w-4 text-white/50" />
      </div>
      {trend !== 0 && (
        <div className={cn(
          'flex items-center gap-0.5 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-lg',
          trend > 0 ? 'text-white/50 bg-white/5' : 'text-white/30 bg-white/5'
        )}>
          {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-4xl font-black text-white tracking-tighter leading-none mb-2">
      <AnimatedCounter value={value} suffix={suffix} />
    </p>
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">{label}</p>
  </div>
);

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{label}</p>
        <p className="text-sm font-black text-white">{payload[0].value} screenings</p>
      </div>
    );
  }
  return null;
};

const ScoreTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <p className="text-sm font-black text-white">{data.name}</p>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{data.value} candidates</p>
      </div>
    );
  }
  return null;
};

// ── Section Header ────────────────────────────────────────────────────────────
const SectionCard = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <div
    className={cn('bg-white/[0.02] border border-white/5 rounded-2xl p-6 animate-fade-in-up', className)}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
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
        <div className="h-14 w-72 bg-white/5 animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const isEmpty = stats.totalJobs === 0 && stats.totalCandidates === 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-2">
            Command Center
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
            {getGreeting()},&nbsp;
            <span className="text-white/25">{userName}.</span>
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/20 mt-3">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2 h-10 bg-transparent border-white/10 text-white/40 hover:bg-white/5 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
          <Link to="/screenings">
            <Button className="gap-2 h-10 bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all">
              <ScanSearch className="h-3.5 w-3.5" />
              Run Screening
            </Button>
          </Link>
          <Link to="/jobs">
            <Button
              variant="outline"
              className="gap-2 h-10 bg-transparent border-white/10 text-white/40 hover:bg-white/5 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Post Job
            </Button>
          </Link>
        </div>
      </div>

      {isEmpty ? (
        /* ── Empty State ── */
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-16 text-center animate-fade-in-up">
          <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
            <Briefcase className="h-7 w-7 text-white/30" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-4">
            System Ready
          </span>
          <h3 className="text-3xl font-black text-white tracking-tighter mb-3">
            Welcome to <span className="text-white/25">UMURAVA.</span>
          </h3>
          <p className="text-sm text-white/30 mb-8 max-w-md mx-auto leading-relaxed font-medium">
            Post your first job to begin receiving applications. The system will rank candidates based on your requirements.
          </p>
          <Link to="/jobs">
            <Button className="gap-2 h-12 bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl px-8">
              <Plus className="h-4 w-4" />
              Post First Job
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI icon={Briefcase} label={t('dashboard.totalJobs')} value={stats.totalJobs} trend={0} delay={0} />
            <KPI icon={Users} label={t('dashboard.totalCandidates')} value={stats.totalCandidates} trend={0} delay={80} />
            <KPI icon={ScanSearch} label={t('dashboard.screeningsRun')} value={stats.screeningsRun} trend={0} delay={160} />
            <KPI icon={TrendingUp} label={t('dashboard.avgMatch')} value={stats.avgMatch} suffix="%" trend={0} delay={240} />
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard className="lg:col-span-2" delay={320}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Activity</p>
                  <h3 className="text-base font-black text-white tracking-tight">{t('dashboard.screeningActivity')}</h3>
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/15">Last 7 days</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={screeningData} onMouseMove={(e) => setHoveredBar(e?.activeIndex ?? null)} onMouseLeave={() => setHoveredBar(null)}>
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.1)" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }} />
                  <YAxis stroke="rgba(255,255,255,0.1)" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.25)', fontWeight: 900 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="screenings" radius={[6, 6, 0, 0]} animationDuration={600} animationEasing="ease-out">
                    {screeningData.map((_, index) => (
                      <Cell key={index} fill={hoveredBar === index ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard delay={400}>
              <div className="mb-4">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Distribution</p>
                <h3 className="text-base font-black text-white tracking-tight">{t('dashboard.scoreDist')}</h3>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={scoreDist} dataKey="value" innerRadius={40} outerRadius={68} paddingAngle={3} animationDuration={500} animationEasing="ease-out">
                    {scoreDist.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color || `rgba(255,255,255,${0.1 + index * 0.05})`}
                        opacity={hoveredPie === null || hoveredPie === index ? 1 : 0.4}
                        style={{ transition: 'opacity 150ms ease-out' }}
                        onMouseEnter={() => setHoveredPie(index)}
                        onMouseLeave={() => setHoveredPie(null)}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ScoreTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {scoreDist.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30">{s.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-white/60">{s.value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* ── Bottom Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard className="lg:col-span-2" delay={480}>
              <div className="mb-5">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Analysis</p>
                <h3 className="text-base font-black text-white tracking-tight">{t('dashboard.topSkills')}</h3>
              </div>
              <div className="space-y-4">
                {skillsData.length === 0 ? (
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 py-8 text-center">
                    No skills data — upload candidates to analyze
                  </p>
                ) : (
                  skillsData.map((s, i) => (
                    <div key={s.skill}>
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/60">{s.skill}</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25">{s.count} candidates</span>
                      </div>
                      <div className="h-[3px] rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-white/30 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${(s.count / (s.maxCount || 1)) * 100}%`, transitionDelay: `${i * 100}ms` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard delay={560}>
              <div className="mb-5">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Log</p>
                <h3 className="text-base font-black text-white tracking-tight">{t('dashboard.recentActivity')}</h3>
              </div>
              <div className="space-y-1.5">
                {activity.length === 0 ? (
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 py-6 text-center">
                    No activity yet
                  </p>
                ) : (
                  activity.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group cursor-default">
                      <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors mt-0.5">
                        <span className="text-[10px]">📋</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white/60 leading-snug truncate">{item.description || item.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-md bg-white/5 text-white/25">{item.action}</span>
                          <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white/15">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        </>
      )}

      {/* ── Floating Chat Button ── */}
      <Link
        to="/chat"
        className={cn(
          'fixed bottom-6 right-6 h-12 w-12 rounded-2xl bg-white shadow-[0_4px_30px_rgba(255,255,255,0.2)] flex items-center justify-center text-black',
          'hover:scale-105 hover:shadow-[0_4px_40px_rgba(255,255,255,0.35)] transition-all duration-200',
          fabPulse && 'animate-pulse'
        )}
      >
        <MessageSquare className="h-5 w-5" />
      </Link>
    </div>
  );
}
