'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Target, Loader2, TrendingDown, Award, Sparkles } from 'lucide-react';
import { insightsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

type Insight = {
  icon: React.ElementType;
  title: string;
  text: string;
  tag: string;
};

export default function Insights() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const generateInsights = async () => {
      try {
        const [stats, scoreDist, topSkills] = await Promise.all([
          insightsApi.getStats(),
          insightsApi.getScoreDistribution(),
          insightsApi.getTopSkills(),
        ]);

        const generated: Insight[] = [];

        if (stats.totalJobs > 0) generated.push({ icon: Target, title: 'Active Positions', text: `${stats.totalJobs} job posting${stats.totalJobs > 1 ? 's' : ''} with ${stats.totalCandidates} total candidate${stats.totalCandidates !== 1 ? 's' : ''} in the pipeline.`, tag: 'Summary' });

        const totalScreening = scoreDist.reduce((s: number, d: any) => s + d.value, 0);
        if (totalScreening > 0) {
          const highPct = Math.round((scoreDist.find((d: any) => d.name === '85%+')?.value || 0) / totalScreening * 100);
          generated.push({ icon: Award, title: 'High-Match Rate', text: `${highPct}% of screened candidates score 85% or higher — strong pipeline quality.`, tag: 'Performance' });
        }

        if (stats.avgMatch > 0) generated.push({ icon: TrendingUp, title: 'Match Average', text: `Screening average is ${stats.avgMatch}% — ${stats.avgMatch >= 70 ? 'strong' : stats.avgMatch >= 50 ? 'moderate' : 'developing'} pipeline quality.`, tag: 'Metrics' });

        if (topSkills.length > 0) generated.push({ icon: Sparkles, title: 'Top Skill', text: `"${topSkills[0].skill}" appears across ${topSkills[0].count} posting${topSkills[0].count > 1 ? 's' : ''}.`, tag: 'Skills' });

        if (scoreDist.length > 0) {
          const low = scoreDist.find((d: any) => d.name === '<60%');
          if (low && low.value > 0) generated.push({ icon: TrendingDown, title: 'Candidates Need Review', text: `${low.value} candidate${low.value !== 1 ? 's' : ''} scored below 60% — consider refining job requirements.`, tag: 'Action' });
        }

        if (stats.totalCandidates === 0) generated.push({ icon: Users, title: 'Get Started', text: 'Upload candidates to your jobs to start generating AI-powered insights.', tag: 'Next Step' });

        setInsights(generated);
      } catch {
        setInsights([{ icon: Sparkles, title: 'System Offline', text: 'Unable to load insights at this time. Please try again later.', tag: 'Status' }]);
      } finally { setLoading(false); }
    };
    generateInsights();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-2">Intelligence</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
          AI <span className="text-white/20">Insights.</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-3">Generated from your live hiring data</p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins, i) => (
          <div
            key={i}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 animate-fade-in-up group"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                <ins.icon className="h-4 w-4 text-white/40" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-white">{ins.title}</h3>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg bg-white/5 text-white/25">{ins.tag}</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed font-medium">{ins.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}