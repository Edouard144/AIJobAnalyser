'use client';

import { useState, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobsApi, screeningApi } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="text-sm font-black text-white">{p.value} {p.dataKey}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalScreenings: 0, totalCandidates: 0, avgScore: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res: any = await jobsApi.getAll();
        const jobs = Array.isArray(res) ? res : (res?.data || []);
        const history: any[] = [];
        let totalScreenings = 0, totalScore = 0, scoreCount = 0;

        for (const job of jobs.slice(0, 10)) {
          try {
            const results = await screeningApi.getResults(job.id);
            if (results && Array.isArray(results) && results.length > 0) {
              totalScreenings++;
              results.forEach((r: any) => {
                const score = parseFloat(r.score || 0);
                if (score > 0) { totalScore += score; scoreCount++; }
              });
              history.unshift({ id: job.id, date: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A', job: job.title, candidates: results.length, topScore: Math.round(Math.max(...results.map((r: any) => parseFloat(r.score || 0)))) });
            }
          } catch {}
        }

        setHistoryData(history);
        setStats({ totalScreenings, totalCandidates: jobs.reduce((s: number, j: any) => s + (j._count?.candidates || 0), 0), avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0 });

        const monthly: any[] = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(); date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en', { month: 'short' });
          const s = history.filter(h => { const d = new Date(h.date); return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear(); }).length;
          monthly.push({ m: monthName, screenings: s || 0, hires: Math.floor((s || 0) * 0.15) });
        }
        setMonthlyData(monthly);

        const candidates = jobs.reduce((s: number, j: any) => s + (j._count?.candidates || 0), 0);
        setFunnelData(candidates > 0 ? [
          { stage: 'Applied', value: candidates },
          { stage: 'Screened', value: Math.round(candidates * 0.7) },
          { stage: 'Interview', value: Math.round(candidates * 0.2) },
          { stage: 'Offer', value: Math.round(candidates * 0.08) },
          { stage: 'Hired', value: Math.round(candidates * 0.05) },
        ] : []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
    </div>
  );

  const statItems = [
    { label: 'Screenings Run', value: stats.totalScreenings },
    { label: 'Total Candidates', value: stats.totalCandidates },
    { label: 'Avg Match Score', value: `${stats.avgScore}%` },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-2">Analytics</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
            Reports <span className="text-white/20">Hub.</span>
          </h1>
        </div>
        <Button variant="outline" className="gap-2 h-10 bg-transparent border-white/10 text-white/40 hover:bg-white/5 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl">
          <Download className="h-3.5 w-3.5" />Export PDF
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {statItems.map((s, i) => (
          <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-4xl font-black text-white tracking-tighter mb-2">{s.value}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 animate-fade-in-up">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Trend</p>
          <h3 className="text-base font-black text-white tracking-tight mb-4">Monthly Screenings</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="obsidianGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="m" stroke="transparent" fontSize={9} tick={{ fill: 'rgba(255,255,255,0.25)', fontWeight: 900, letterSpacing: '0.1em' }} />
                <YAxis stroke="transparent" fontSize={9} tick={{ fill: 'rgba(255,255,255,0.25)', fontWeight: 900 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="screenings" stroke="rgba(255,255,255,0.4)" fill="url(#obsidianGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/15">Run screenings to see trends</p>
            </div>
          )}
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Pipeline</p>
          <h3 className="text-base font-black text-white tracking-tight mb-5">Hiring Funnel</h3>
          {funnelData.length > 0 ? (
            <div className="space-y-4">
              {funnelData.map((f, i) => {
                const pct = (f.value / funnelData[0].value) * 100;
                return (
                  <div key={f.stage}>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50">{f.stage}</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25">{f.value} · {pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-[3px] rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-white/25 rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, transitionDelay: `${i * 100}ms` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/15">Add candidates to see funnel</p>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '240ms' }}>
        <div className="px-6 pt-6 pb-4 border-b border-white/5">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Screening Log</p>
        </div>
        {historyData.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Date', 'Position', 'Candidates', 'Top Score'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[8px] font-black uppercase tracking-[0.3em] text-white/20">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyData.map((r: any, i: number) => (
                <tr key={r.id || i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.1em] text-white/25">{r.date}</td>
                  <td className="px-6 py-4 text-[11px] font-bold text-white/60">{r.job}</td>
                  <td className="px-6 py-4 text-[10px] font-black text-white/40">{r.candidates}</td>
                  <td className="px-6 py-4 text-[10px] font-black text-white/60">{r.topScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/15">Run your first screening to see history</p>
          </div>
        )}
      </div>
    </div>
  );
}