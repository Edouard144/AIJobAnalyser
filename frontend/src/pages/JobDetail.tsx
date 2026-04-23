'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Clock, Sparkles, Loader2, Upload, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        
        // Get screening results to merge scores
        try {
          const results: any = await screeningApi.getResults(id);
          const merged = candsArray.map((c: any) => {
            const result = results.find((r: any) => r.candidate?.id === c.id);
            return {
              ...c,
              matchScore: result?.score ? parseFloat(result.score) : (c.matchScore || 0),
            };
          });
          setCandidates(merged.sort((a: any, b: any) => b.matchScore - a.matchScore));
        } catch {
          setCandidates(candsArray);
        }
      } catch (err) {
        console.error('Error loading job:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  // Inline screening effect
  useEffect(() => {
    if (screeningStep !== 'scanning' || !id) return;
    
    const runScreening = async () => {
      setScreeningProgress(0);
      const total = 8000;
      const start = Date.now();
      
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
            } catch (err: any) {
              console.error('[Screening] Error:', err);
              toast.error(err.message);
              setScreeningStep('idle');
            }
          }, 300);
        }
      }, 100);
    };
    
    runScreening();
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
    } catch (err: any) {
      console.error('[CSV Upload] Error:', err);
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Back to jobs
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Job not found</p>
        </div>
      </div>
    );
  }

  const skills = job.requiredSkills || job.skills || [];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to jobs
      </Link>

      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full',
                job.status === 'open' && 'bg-success/10 text-success',
                job.status === 'screening' && 'bg-warning/10 text-warning',
                job.status === 'closed' && 'bg-muted text-muted-foreground',
              )}>
                {job.status || 'open'}
              </span>
              <span className="text-xs text-muted-foreground">{job.department || 'General'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.location || 'Remote'}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{candidates.length} candidates</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'recently'}</span>
            </div>
          </div>
          <Button 
              onClick={() => {
                if (!id || candidates.length === 0) {
                  toast.error('Add candidates first');
                  return;
                }
                setScreeningStep('scanning');
              }}
              disabled={screeningStep === 'scanning'}
              className="gap-2 bg-gradient-primary glow-primary"
            >
              {screeningStep === 'scanning' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {screeningStep === 'scanning' ? 'Screening...' : 'Run AI Screening'}
            </Button>
            
            {screeningStep === 'scanning' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-warning" />Analyzing candidates...</span>
                  <span className="text-xs text-muted-foreground">{Math.round(screeningProgress)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary transition-all duration-300" 
                    style={{ width: `${screeningProgress}%` }}
                  />
                </div>
              </div>
            )}
        </div>

        {screeningStep === 'results' && screeningResults.length > 0 && (
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-warning" />Screening Results</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setScreeningStep('idle')}
              >
                Run again
              </Button>
            </div>
            <div className="grid gap-3">
              {screeningResults.slice(0, 10).map((r: any, i: number) => {
                const cand = r.candidate || {};
                const name = cand.fullName || `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'Unknown';
                return (
                  <div key={r.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30">
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', i === 0 ? 'bg-warning text-warning-foreground' : 'bg-muted')}>{i + 1}</div>
                    <GradientAvatar name={name} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">{cand.currentPosition || cand.email}</p>
                    </div>
                    <ScoreRing score={parseFloat(r.score) || 0} size={36} stroke={3} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {job.description && (
          <p className="text-muted-foreground leading-relaxed mb-6">{job.description}</p>
        )}

        {skills.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Required skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s: string) => (
                <span key={s} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-display font-semibold mb-4">Candidates ({candidates.length})</h2>
        {candidates.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-muted-foreground mb-4">No candidates for this job yet</p>
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Add Candidates</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle className="font-display">Upload candidates for {job.title}</DialogTitle></DialogHeader>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDragEnd={() => setDragOver(false)}
                  className={cn(
                    'rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer',
                    dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold mb-1">Drop CSV or Excel here</p>
                  <p className="text-xs text-muted-foreground">CSV or Excel file with candidate data</p>
                  <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" id="job-csv-upload" />
                  <label htmlFor="job-csv-upload">
                    <Button variant="outline" size="sm" className="mt-4 cursor-pointer" asChild>
                      <span>{uploading ? 'Uploading...' : 'or browse files'}</span>
                    </Button>
                  </label>
                </div>
              </DialogContent>
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
                  className="glass rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 transition-all animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <GradientAvatar name={name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.experienceYears || 0} years exp · {(c.skills || []).slice(0, 3).map((s: any) => typeof s === 'string' ? s : s.name).join(', ')}
                    </p>
                  </div>
                  <ScoreRing score={score} size={48} stroke={4} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}