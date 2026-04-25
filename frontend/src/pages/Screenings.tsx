'use client';

import { useState, useEffect } from 'react';
import { Trophy, Download, Zap, Loader2, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobsApi, screeningApi, activityApi } from '@/lib/api';
import { ScoreRing } from '@/components/ScoreRing';
import { GradientAvatar } from '@/components/Avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
      .then(async (res: any) => {
        const jobsArray = Array.isArray(res) ? res : (res?.data || []);
        const jobsWithCounts = await Promise.all(jobsArray.map(async (j: any) => {
          try { const c: any = await jobsApi.getCandidates(j.id); return { ...j, _count: { candidates: Array.isArray(c) ? c.length : (c?.data?.length || 0) } }; }
          catch { return { ...j, _count: { candidates: 0 } }; }
        }));
        setJobs(jobsWithCounts);
        if (jobsWithCounts.length > 0) setSelectedJob(jobsWithCounts[0].id);
      })
      .catch(err => { console.error('Failed to load jobs:', err); setJobs([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (step !== 'scanning') return;
    setProgress(0); setStage(0);
    const total = 7000, start = Date.now();
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
            if (typeof window !== 'undefined') {
              try { const confetti = (await import('canvas-confetti')).default; confetti({ particleCount: 100, spread: 70, origin: { y: 0.4 }, colors: ['#ffffff', '#aaaaaa', '#555555'] }); }
              catch {}
            }
            activityApi.create('screening_completed', selectedJob, `Completed screening for ${resultsData.length} candidates`).catch(() => {});
          } catch (err: any) { toast.error(err.message); setStep('select'); }
        }, 400);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [step, selectedJob]);

  const getExistingResults = async () => {
    if (!selectedJob) return;
    try { const data = await screeningApi.getResults(selectedJob); setResults(Array.isArray(data) ? data : []); setStep('results'); }
    catch (err: any) { console.error('Failed to get results:', err); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
    </div>
  );

  /* ── Scanning State ── */
  if (step === 'scanning') return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-lg mx-auto">
      <div className="relative mb-10">
        <div className="h-28 w-28 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Brain className="h-12 w-12 text-white/40 animate-pulse" />
        </div>
        <span className="absolute inset-[-8px] rounded-full border border-white/10 animate-ping opacity-30" />
        <span className="absolute inset-[-16px] rounded-full border border-white/5 animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-3">Processing</span>
      <h2 className="text-4xl font-black text-white tracking-tighter leading-none mb-4">
        AI Analyzing <span className="text-white/20">Candidates.</span>
      </h2>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-10 animate-fade-in" key={stage}>
        {STAGES[stage]}
      </p>
      <div className="w-full max-w-sm">
        <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-white/40 transition-all duration-100 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-3">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">{Math.round(progress)}%</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/15">{Math.max(0, Math.ceil((100 - progress) * 0.07))}s remaining</span>
        </div>
      </div>
    </div>
  );

  /* ── Results State ── */
  if (step === 'results') {
    const top3 = results.slice(0, 3);
    const job = jobs.find((j: any) => j.id === selectedJob);

    const exportCSV = () => {
      const headers = ['Rank', 'Name', 'Email', 'Score', 'Recommendation', 'Strengths', 'Gaps'];
      const rows = results.map((r: any) => {
        const cand = r.candidate || {};
        return [r.rank || 0, cand.fullName || `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Unknown', cand.email || '', r.score || 0, r.recommendation || '', (r.strengths || []).join('; '), (r.gaps || []).join('; ')];
      });
      const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = `screening-${selectedJob}-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    };

    return (
      <div className="space-y-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-2">Complete</span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
              Screening <span className="text-white/20">Results.</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-3">
              {job?.title} · {results.length} candidates analyzed
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV} className="gap-2 h-10 bg-transparent border-white/10 text-white/40 hover:bg-white/5 hover:text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl">
              <Download className="h-3.5 w-3.5" />Export CSV
            </Button>
            <Button onClick={() => setStep('select')} className="gap-2 h-10 bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl">
              New Screening
            </Button>
          </div>
        </div>

        {!results.length ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl py-20 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">No results for this job</p>
            <Button onClick={() => setStep('scanning')} className="h-10 bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl">Run Screening</Button>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3.map((c, i) => {
                const cand = c.candidate || c;
                const name = cand.fullName || `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Unknown';
                return (
                  <div key={c.id || i}
                    className={cn('bg-white/[0.02] border rounded-2xl p-6 text-center animate-fade-in-up relative overflow-hidden transition-all',
                      i === 0 ? 'md:order-2 md:-mt-4 border-white/20 bg-white/[0.04]' : 'border-white/5',
                    )}
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    {i === 0 && <div className="absolute top-4 right-4"><Trophy className="h-4 w-4 text-white/30" /></div>}
                    <div className={cn('inline-flex items-center justify-center h-7 w-7 rounded-xl text-[9px] font-black uppercase tracking-wider mb-4',
                      i === 0 ? 'bg-white text-black' : 'bg-white/5 text-white/30'
                    )}>#{i + 1}</div>
                    <div className="flex justify-center mb-3"><GradientAvatar name={name} size={72} /></div>
                    <p className="text-[11px] font-black uppercase tracking-[0.05em] text-white mb-1">{name}</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-4">{cand.experienceYears ?? 0} yrs exp</p>
                    <div className="flex justify-center"><ScoreRing score={parseFloat(c.score || 0)} size={72} /></div>
                  </div>
                );
              })}
            </div>

            {/* Ranked List */}
            {results.length > 3 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-white/5">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Full Rankings</p>
                </div>
                <div className="divide-y divide-white/5">
                  {results.slice(3).map((c, i) => {
                    const cand = c.candidate || c;
                    const name = cand.fullName || `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Unknown';
                    const skills = cand.skills || [];
                    return (
                      <div key={c.id || i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors animate-fade-in-up" style={{ animationDelay: `${(i + 3) * 60}ms` }}>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 w-8">#{i + 4}</span>
                        <GradientAvatar name={name} size={36} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black uppercase tracking-[0.05em] text-white/70 truncate">{name}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {skills.slice(0, 3).map((s: any, idx: number) => {
                              const skillName = typeof s === 'string' ? s : (s.name || '');
                              return skillName ? <span key={skillName || idx} className="text-[8px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-md bg-white/5 text-white/25">{skillName}</span> : null;
                            })}
                          </div>
                        </div>
                        <ScoreRing score={parseFloat(c.score || 0)} size={40} />
                        <span className={cn('text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg hidden sm:block',
                          c.recommendation === 'SHORTLIST' ? 'bg-white/10 text-white/50' :
                          c.recommendation === 'CONSIDER' ? 'bg-white/5 text-white/35' :
                          c.recommendation === 'REJECT' ? 'bg-white/5 text-white/20' : 'bg-white/5 text-white/25'
                        )}>{c.recommendation || 'New'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  /* ── Select Job State ── */
  if (jobs.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">No jobs found</p>
        <Button onClick={() => window.location.href = '/jobs'} className="h-10 bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl">Go to Jobs</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center animate-fade-in-up">
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-3">Engine</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-3">
          AI <span className="text-white/20">Screening.</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">Analyze and rank candidates automatically</p>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-3 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-4">Select Position</p>
        {jobs.map((j: any) => (
          <button key={j.id} onClick={() => setSelectedJob(j.id)}
            className={cn('w-full p-4 rounded-xl text-left transition-all border',
              selectedJob === j.id
                ? 'border-white/20 bg-white/[0.04]'
                : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.05em] text-white/70">{j.title}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mt-0.5">{j._count?.candidates || 0} candidates</p>
              </div>
              {selectedJob === j.id && <Sparkles className="h-4 w-4 text-white/30" />}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
        <Button onClick={getExistingResults} variant="outline" className="flex-1 h-12 bg-transparent border-white/10 text-white/40 hover:bg-white/5 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl" disabled={!selectedJob}>
          View Previous Results
        </Button>
        <Button onClick={() => setStep('scanning')} className="flex-1 h-12 bg-white text-black hover:bg-white/90 gap-2 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl" disabled={!selectedJob}>
          <Zap className="h-3.5 w-3.5" />Run New Screening
        </Button>
      </div>
    </div>
  );
}