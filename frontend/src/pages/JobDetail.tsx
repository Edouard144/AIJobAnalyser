'use client';

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Clock, Sparkles, Loader2, Upload, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobsApi, screeningApi, activityApi } from '@/lib/api';
import { ScoreRing } from '@/components/ScoreRing';
import { GradientAvatar } from '@/components/Avatar';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function JobDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [screeningStep, setScreeningStep] = useState<'idle' | 'scanning' | 'results'>('idle');
  const [screeningProgress, setScreeningProgress] = useState(0);
  const [screeningResults, setScreeningResults] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        const jobData: any = await jobsApi.getOne(id);
        setJob(jobData);
        const cands: any = await jobsApi.getCandidates(id);
        const candsArray = Array.isArray(cands) ? cands : (cands?.data || []);
        try {
          const results: any = await screeningApi.getResults(id);
          const merged = candsArray.map((c: any) => {
            const result = results.find((r: any) => r.candidate?.id === c.id);
            return { ...c, matchScore: result?.score ? parseFloat(result.score) : (c.matchScore || 0) };
          });
          setCandidates(merged.sort((a: any, b: any) => b.matchScore - a.matchScore));
        } catch { setCandidates(candsArray); }
      } catch (err) { console.error('Error loading job:', err); }
      finally { setLoading(false); }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    if (screeningStep !== 'scanning' || !id) return;
    setScreeningProgress(0);
    const total = 8000, start = Date.now();
    const tick = setInterval(async () => {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / total) * 100, 100);
      setScreeningProgress(p);
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(async () => {
          try {
            const data: any = await screeningApi.run(id, 10);
            const resultsData = data.results || data || [];
            setScreeningResults(resultsData);
            setScreeningStep('results');
            toast.success(`Screening complete! ${resultsData.length} candidates analyzed`);
            activityApi.create('screening_completed', id, `${resultsData.length} candidates`).catch(() => {});
          } catch (err: any) { toast.error(err.message); setScreeningStep('idle'); }
        }, 300);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [screeningStep, id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploading(true);
    try {
      const result: any = await jobsApi.uploadCandidates(id, file);
      const count = result?.inserted || result?.candidates?.length || 0;
      toast.success(`${count} candidate${count !== 1 ? 's' : ''} uploaded!`);
      setUploadOpen(false);
      const cands: any = await jobsApi.getCandidates(id);
      setCandidates(Array.isArray(cands) ? cands : (cands?.data || []));
      activityApi.create('candidates_uploaded', id, { count }).catch(() => {});
    } catch (err: any) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
    </div>
  );

  if (!job) return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />Back to Jobs
      </Link>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl py-20 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Position not found</p>
      </div>
    </div>
  );

  const skills = job.requiredSkills || job.skills || [];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Back */}
      <Link to="/jobs" className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors animate-fade-in-up">
        <ArrowLeft className="h-3.5 w-3.5" />Back to Jobs
      </Link>

      {/* Job Header Card */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 animate-fade-in-up">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn('text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg',
                job.status === 'open' ? 'bg-white/10 text-white/50' :
                job.status === 'screening' ? 'bg-white/5 text-white/35' : 'bg-white/5 text-white/20'
              )}>{job.status || 'open'}</span>
              {job.department && <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">{job.department}</span>}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none mb-4">{job.title}</h1>
            <div className="flex flex-wrap gap-5">
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white/25">
                <MapPin className="h-3 w-3" />{job.location || 'Remote'}
              </span>
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white/25">
                <Users className="h-3 w-3" />{candidates.length} candidates
              </span>
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white/25">
                <Clock className="h-3 w-3" />Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'recently'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 h-10 bg-transparent border-white/10 text-white/40 hover:bg-white/5 hover:text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl">
                  <Upload className="h-3.5 w-3.5" />Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-[#0d0d0d] border border-white/10 rounded-2xl text-white">
                <DialogHeader><DialogTitle className="text-sm font-black uppercase tracking-[0.3em] text-white/60">Upload Candidates</DialogTitle></DialogHeader>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDragEnd={() => setDragOver(false)}
                  className={cn('rounded-2xl border border-dashed p-12 text-center transition-all mt-2',
                    dragOver ? 'border-white/30 bg-white/5' : 'border-white/10 hover:border-white/20')}
                >
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-white/30" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-1">Drop CSV or Excel here</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20">CSV or Excel · max 10MB</p>
                  <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" id="job-csv-upload" />
                  <label htmlFor="job-csv-upload">
                    <span className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                      {uploading ? 'Uploading...' : 'Browse files'}
                    </span>
                  </label>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={() => {
                if (!id || candidates.length === 0) { toast.error('Add candidates first'); return; }
                setScreeningStep('scanning');
              }}
              disabled={screeningStep === 'scanning'}
              className="gap-2 h-10 bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl"
            >
              {screeningStep === 'scanning' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {screeningStep === 'scanning' ? 'Analyzing...' : 'Run Screening'}
            </Button>
          </div>
        </div>

        {/* Scanning Progress */}
        {screeningStep === 'scanning' && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                <Zap className="h-3 w-3" />Analyzing candidates
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">{Math.round(screeningProgress)}%</span>
            </div>
            <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-white/30 transition-all duration-300 rounded-full" style={{ width: `${screeningProgress}%` }} />
            </div>
          </div>
        )}

        {/* Screening Results Inline */}
        {screeningStep === 'results' && screeningResults.length > 0 && (
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-white/30" />
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Screening Results</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setScreeningStep('idle')}
                className="bg-transparent border-white/10 text-white/30 hover:text-white hover:bg-white/5 text-[9px] font-black uppercase tracking-[0.15em] rounded-lg h-8">
                Run again
              </Button>
            </div>
            <div className="grid gap-2">
              {screeningResults.slice(0, 10).map((r: any, i: number) => {
                const cand = r.candidate || {};
                const name = cand.fullName || `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Unknown';
                return (
                  <div key={r.id || i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black',
                      i === 0 ? 'bg-white text-black' : 'bg-white/5 text-white/30')}>
                      {i + 1}
                    </div>
                    <GradientAvatar name={name} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-white/60 truncate">{name}</p>
                      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/25 truncate">{cand.currentPosition || cand.email}</p>
                    </div>
                    <ScoreRing score={parseFloat(r.score) || 0} size={36} stroke={3} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <p className="text-sm text-white/40 leading-relaxed mb-6 font-medium">{job.description}</p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Required Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s: string) => (
                <span key={s} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.1em] text-white/40">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Candidates Section */}
      <div className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Pipeline</p>
            <h2 className="text-xl font-black text-white tracking-tight">Candidates ({candidates.length})</h2>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl py-16 text-center">
            <Users className="h-8 w-8 text-white/10 mx-auto mb-4" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">No candidates yet</p>
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-10 bg-transparent border-white/10 text-white/40 hover:bg-white/5 hover:text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl">
                  Add Candidates
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          <div className="grid gap-3">
            {candidates.map((c: any, i: number) => {
              const name = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown';
              const score = c.matchScore || 0;
              return (
                <div
                  key={c.id}
                  className="bg-white/[0.02] border border-white/5 rounded-xl px-5 py-4 flex items-center gap-4 hover:bg-white/[0.04] hover:border-white/10 transition-all animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <GradientAvatar name={name} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.05em] text-white/70 truncate">{name}</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/25 truncate mt-0.5">
                      {c.experienceYears || 0} yrs exp · {(c.skills || []).slice(0, 3).map((s: any) => typeof s === 'string' ? s : s.name).join(', ')}
                    </p>
                  </div>
                  <ScoreRing score={score} size={44} stroke={4} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}