'use client';

import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Users, Target, Loader2, TrendingDown, Award, Clock } from 'lucide-react';
import { insightsApi } from '@/lib/api';

type Insight = {
  icon: React.ElementType;
  title: string;
  text: string;
  tag: string;
  color: string;
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

        const generatedInsights: Insight[] = [];

        if (stats.totalJobs > 0) {
          generatedInsights.push({
            icon: Target,
            title: 'Active job postings',
            text: `You have ${stats.totalJobs} job posting${stats.totalJobs > 1 ? 's' : ''} with ${stats.totalCandidates} total candidate${stats.totalCandidates !== 1 ? 's' : ''}.`,
            tag: 'Summary',
            color: 'text-primary bg-primary/10',
          });
        }

        const totalScreening = scoreDist.reduce((s, d) => s + d.value, 0);
        if (totalScreening > 0) {
          const highPct = Math.round((scoreDist.find(d => d.name === '85%+')?.value || 0) / totalScreening * 100);
          generatedInsights.push({
            icon: Award,
            title: 'High-match candidates',
            text: `${highPct}% of screened candidates score 85% or higher. Keep up the quality sourcing!`,
            tag: 'Performance',
            color: 'text-success bg-success/10',
          });
        }

        if (stats.avgMatch > 0) {
          const trend = stats.avgMatch >= 70 ? 'strong' : stats.avgMatch >= 50 ? 'moderate' : 'developing';
          generatedInsights.push({
            icon: TrendingUp,
            title: 'Average match score',
            text: `Your screening average is ${stats.avgMatch}% — a ${trend} pipeline quality indicator.`,
            tag: 'Metrics',
            color: 'text-secondary bg-secondary/10',
          });
        }

        if (topSkills.length > 0) {
          const topSkill = topSkills[0];
          generatedInsights.push({
            icon: Sparkles,
            title: 'Top skill in demand',
            text: `"${topSkill.skill}" appears across ${topSkill.count} job posting${topSkill.count > 1 ? 's' : ''}.`,
            tag: 'Skills',
            color: 'text-warning bg-warning/10',
          });
        }

        if (scoreDist.length > 0) {
          const lowScore = scoreDist.find(d => d.name === '<60%');
          if (lowScore && lowScore.value > 0) {
            generatedInsights.push({
              icon: TrendingDown,
              title: 'Candidates need review',
              text: `${lowScore.value} candidate${lowScore.value !== 1 ? 's' : ''} scored below 60% — consider refining job requirements.`,
              tag: 'Action',
              color: 'text-destructive bg-destructive/10',
            });
          }
        }

        if (stats.totalCandidates === 0) {
          generatedInsights.push({
            icon: Users,
            title: 'Get started',
            text: 'Upload candidates to your jobs to start generating AI-powered insights.',
            tag: 'Next Step',
            color: 'text-primary bg-primary/10',
          });
        }

        setInsights(generatedInsights);
      } catch {
        setInsights([{
          icon: Sparkles,
          title: 'Loading insights...',
          text: 'Unable to load insights at this time. Please try again later.',
          tag: 'Status',
          color: 'text-muted-foreground bg-muted',
        }]);
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">Insights</h1>
        <p className="text-muted-foreground mt-1">AI-generated insights from your hiring data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins, i) => (
          <div key={i} className="glass rounded-2xl p-6 hover:scale-[1.01] transition-all animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${ins.color}`}>
                <ins.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{ins.title}</h3>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted">{ins.tag}</span>
                </div>
                <p className="text-sm text-muted-foreground">{ins.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}