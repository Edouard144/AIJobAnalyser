'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Trophy, Download, Zap, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobsApi, screeningApi, activityApi } from '@/lib/api';
import { ScoreRing } from '@/components/ScoreRing';
import { GradientAvatar } from '@/components/Avatar';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const STAGES = [
  'Parsing resumes…',
  'Extracting skills…',
  'Matching with job requirements…',
  'Evaluating experience depth…',
  'Generating AI insights…',
  'Ranking candidates…',
  'Done!',
];

export default function Screenings() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [step, setStep] = useState<'select' | 'scanning' | 'results'>('select');
  const [selectedJob, setSelectedJob] = useState('');
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    jobsApi.getAll()
      .then((j: any) => {
        setJobs(j);
        if (j.length > 0) setSelectedJob(j[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (step !== 'scanning') return;
    setProgress(0); setStage(0);
    const total = 7000;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / total) * 100, 100);
      setProgress(p);
      setStage(Math.min(Math.floor((p / 100) * STAGES.length), STAGES.length - 1));
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(async () => {
          try {
            const data: any = await screeningApi.run(selectedJob, 10);
            const resultsData = data.results || data || [];
            setResults(resultsData);
            setStep('results');
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.4 }, colors: ['#8AFF6E', '#00FFC8', '#39D98A'] });
            activityApi.create('screening_completed', selectedJob, { candidatesCount: resultsData.length }).catch(() => {});
          } catch (err: any) {
            toast.error(err.message);
            setStep('select');
          }
        }, 400);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [step, selectedJob]);

  const getExistingResults = async () => {
    if (!selectedJob) return;
    try {
      const data = await screeningApi.getResults(selectedJob);
      setResults(data as any[]);
      setStep('results');
    } catch (err: any) {
      toast.error('No results. Run a new screening.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (step === 'scanning') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-xl mx-auto">
        <div className="relative mb-8">
          <div className="h-32 w-32 rounded-full bg-gradient-primary flex items-center justify-center glow-primary animate-glow-pulse">
            <Brain className="h-14 w-14 text-primary-foreground" />
          </div>
          <span className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />
          <span className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" style={{ animationDelay: '0.6s' }} />
          <span className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" style={{ animationDelay: '1.2s' }} />
        </div>
        <h2 className="text-3xl font-display font-bold mb-2">AI is analyzing candidates</h2>
        <p className="text-muted-foreground mb-8 animate-fade-in" key={stage}>{STAGES[stage]}</p>
        <div className="w-full max-w-md">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{Math.round(progress)}%</span>
            <span>{Math.max(0, Math.ceil((100 - progress) * 0.07))}s remaining</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    const top3 = results.slice(0, 3);
    const job = jobs.find((j: any) => j.id === selectedJob);
    return (
      <div className="space-y-8 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success mb-2">
              <Sparkles className="h-3 w-3" />Screening complete
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-bold">Results</h1>
            <p className="text-muted-foreground mt-1">{job?.title || 'Job'} · {results.length} candidates analyzed</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export CSV</Button>
            <Button onClick={() => setStep('select')} className="bg-gradient-primary glow-primary">New screening</Button>
          </div>
        </div>

        {!results.length ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No results found for this job.</p>
            <Button onClick={() => setStep('scanning')} className="bg-gradient-primary">Run Screening</Button>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3.map((c, i) => {
                const cand = c.candidate || c;
                const name = cand.fullName || `${cand.firstName || ''} ${cand.lastName || ''}`;
                return (
                  <div
                    key={c.id || i}
                    className={cn('glass rounded-2xl p-6 text-center animate-fade-in-up relative overflow-hidden',
                      i === 0 && 'md:order-2 md:-mt-4 border-primary/40 glow-primary',
                      i === 1 && 'md:order-1', i === 2 && 'md:order-3')}
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    {i === 0 && <div className="absolute top-3 right-3"><Trophy className="h-5 w-5 text-warning" /></div>}
                    <div className={cn('inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold mb-3',
                      i === 0 ? 'bg-gradient-primary text-primary-foreground' : 'bg-muted')}>#{i + 1}</div>
                    <GradientAvatar name={name} size={80} />
                    <p className="font-semibold mt-2">{name}</p>
                    <p className="text-xs text-muted-foreground mb-4">{cand.experienceYears || 0} years exp</p>
                    <ScoreRing score={parseFloat(c.score || 0)} size={80} />
                  </div>
                );
              })}
            </div>

            {/* Full ranked list */}
            <div className="space-y-2">
              {results.slice(3).map((c, i) => {
                const cand = c.candidate || c;
                const name = cand.fullName || `${cand.firstName || ''} ${cand.lastName || ''}`;
                return (
                  <div key={c.id || i} className="glass rounded-xl p-4 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${(i + 3) * 60}ms` }}>
                    <span className="font-display font-bold text-muted-foreground w-8">#{i + 4}</span>
                    <GradientAvatar name={name} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(cand.skills || []).slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    </div>
                    <ScoreRing score={parseFloat(c.score || 0)} size={44} />
                    <div className="text-right">
                      <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full',
                        c.recommendation === 'SHORTLIST' && 'bg-success/10 text-success',
                        c.recommendation === 'CONSIDER' && 'bg-warning/10 text-warning',
                        c.recommendation === 'REJECT' && 'bg-destructive/10 text-destructive',
                      )}>{c.recommendation || 'New'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Select job step
  const jobOptions = jobs.map((j: any) => ({ id: j.id, title: j.title, candidates: j._count?.candidates || 0 }));

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">AI Screening</h1>
        <p className="text-muted-foreground">Let AI analyze and rank your candidates</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <p className="font-medium">Select a job to screen</p>
        <div className="space-y-2">
          {jobOptions.map((j: any) => (
            <button
              key={j.id}
              onClick={() => setSelectedJob(j.id)}
              className={cn('w-full p-4 rounded-xl text-left transition-all', selectedJob === j.id ? 'bg-primary/10 border-primary' : 'hover:bg-accent/40')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{j.title}</p>
                  <p className="text-xs text-muted-foreground">{j.candidates} candidates</p>
                </div>
                {selectedJob === j.id && <Sparkles className="h-5 w-5 text-primary" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={getExistingResults} variant="outline" className="flex-1 gap-2" disabled={!selectedJob}>
          View Previous Results
        </Button>
        <Button onClick={() => setStep('scanning')} className="flex-1 gap-2 bg-gradient-primary glow-primary" disabled={!selectedJob}>
          <Zap className="h-4 w-4" />Run New Screening
        </Button>
      </div>
    </div>
  );
}