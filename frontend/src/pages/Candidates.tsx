'use client';

import { useState, useEffect } from 'react';
import { Search, Upload, LayoutGrid, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jobsApi, screeningApi } from '@/lib/api';
import { ScoreRing } from '@/components/ScoreRing';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { GradientAvatar } from '@/components/Avatar';

type Candidate = {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  experienceYears?: number;
  educationLevel?: string;
  currentPosition?: string;
  matchScore?: number;
  status?: string;
  strengths?: string[];
  gaps?: string[];
  recommendation?: string;
  createdAt?: string;
};

export default function Candidates() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [view, setView] = useState<'table' | 'card'>('card');
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res: any = await jobsApi.getAll();
        const jobsArray = Array.isArray(res) ? res : (res?.data || []);
        setJobs(jobsArray);
        if (jobsArray.length > 0) {
          setSelectedJob(jobsArray[0].id);
          setLoading(true);
          const cands: any = await jobsApi.getCandidates(jobsArray[0].id);
          setCandidates(cands?.candidates || cands || []);
        } else {
          setCandidates([]);
        }
      } catch {
        setJobs([]);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, []);

  const topMatches = candidates.filter(c => (c.matchScore || 0) >= 85).length;

  const filtered = candidates.filter(c => {
    const name = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase());
    const score = c.matchScore || 0;
    const matchesScore = scoreFilter === 'all' || (scoreFilter === 'high' && score >= 85) || (scoreFilter === 'mid' && score >= 60 && score < 85) || (scoreFilter === 'low' && score < 60);
    return matchesSearch && matchesScore;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedJob) return;
    setUploading(true);
    try {
      await jobsApi.uploadCandidates(selectedJob, file);
      toast.success('Candidates uploaded!');
      setUploadOpen(false);
      const cands: any = await jobsApi.getCandidates(selectedJob);
      setCandidates((cands?.candidates || cands) as Candidate[]);
    } catch (err: any) {
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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} candidates · {topMatches} top matches</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="h-10 px-3 rounded-lg bg-muted border text-sm"
          >
            <option value="">Select a job</option>
            {jobs.map((j: any) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-primary glow-primary"><Upload className="h-4 w-4" />Bulk upload</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle className="font-display">Upload candidates</DialogTitle></DialogHeader>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={cn(
                  'rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer',
                  dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50'
                )}
              >
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold mb-1">Drop CSV here</p>
                <p className="text-xs text-muted-foreground">CSV file with candidate data</p>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
                <label htmlFor="csv-upload">
                  <Button variant="outline" size="sm" className="mt-4 cursor-pointer" asChild>
                    <span>{uploading ? 'Uploading...' : 'or browse files'}</span>
                  </Button>
                </label>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates..." className="pl-10" />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          <button onClick={() => setScoreFilter('all')}
            className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-all', scoreFilter === 'all' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
            All
          </button>
          <button onClick={() => setScoreFilter('high')}
            className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-all', scoreFilter === 'high' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
            85%+
          </button>
          <button onClick={() => setScoreFilter('mid')}
            className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-all', scoreFilter === 'mid' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
            60-84%
          </button>
          <button onClick={() => setScoreFilter('low')}
            className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-all', scoreFilter === 'low' ? 'bg-background shadow-sm' : 'text-muted-foreground')}>
            &lt;60%
          </button>
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-muted ml-auto">
          <button onClick={() => setView('card')} className={cn('p-1.5 rounded-md transition-all', view === 'card' ? 'bg-background shadow-sm' : 'text-muted-foreground')}><LayoutGrid className="h-4 w-4" /></button>
          <button onClick={() => setView('table')} className={cn('p-1.5 rounded-md transition-all', view === 'table' ? 'bg-background shadow-sm' : 'text-muted-foreground')}><List className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Card view */}
      {view === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c, i) => (
            <button
              key={c.id} onClick={() => setSelected(c)}
              className="group glass rounded-2xl p-5 text-left hover:scale-[1.02] hover:shadow-elegant hover:border-primary/40 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <GradientAvatar name={c.fullName || `${c.firstName || ''} ${c.lastName || ''}`} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.fullName || `${c.firstName || ''} ${c.lastName || ''}`}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.currentPosition || c.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <ScoreRing score={c.matchScore || 0} size={48} />
                <div className="text-right">
                  <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full',
                    (c.matchScore || 0) >= 85 && 'bg-success/10 text-success',
                    (c.matchScore || 0) >= 60 && (c.matchScore || 0) < 85 && 'bg-warning/10 text-warning',
                    (c.matchScore || 0) < 60 && 'bg-destructive/10 text-destructive',
                  )}>{c.status || 'New'}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-xs font-medium">Name</th>
                <th className="text-left p-3 text-xs font-medium">Email</th>
                <th className="text-left p-3 text-xs font-medium">Position</th>
                <th className="text-left p-3 text-xs font-medium">Score</th>
                <th className="text-left p-3 text-xs font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => setSelected(c)} className="border-t border-border hover:bg-accent/40 cursor-pointer">
                  <td className="p-3 text-sm">{c.fullName || `${c.firstName || ''} ${c.lastName || ''}`}</td>
                  <td className="p-3 text-sm text-muted-foreground">{c.email}</td>
                  <td className="p-3 text-sm">{c.currentPosition || '-'}</td>
                  <td className="p-3 text-sm"><ScoreRing score={c.matchScore || 0} size={32} /></td>
                  <td className="p-3 text-sm"><span className={cn('text-[10px] px-2 py-1 rounded-full', (c.matchScore || 0) >= 85 && 'bg-success/10 text-success')}>{c.status || 'New'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidate detail sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <GradientAvatar name={selected.fullName || `${selected.firstName || ''} ${selected.lastName || ''}`} size={64} />
                <div>
                  <h2 className="text-xl font-semibold">{selected.fullName || `${selected.firstName || ''} ${selected.lastName || ''}`}</h2>
                  <p className="text-muted-foreground">{selected.currentPosition || selected.email}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <ScoreRing score={selected.matchScore || 0} size={80} />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Experience</p>
                  <p className="text-sm text-muted-foreground">{selected.experienceYears || 0} years</p>
                  <p className="text-sm font-medium mt-3 mb-1">Education</p>
                  <p className="text-sm text-muted-foreground">{selected.educationLevel || 'Not specified'}</p>
                </div>
              </div>
              {(selected.strengths?.length || 0) > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Strengths</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.strengths?.map((s: string) => (
                      <span key={s} className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {(selected.gaps?.length || 0) > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Areas for improvement</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.gaps?.map((s: string) => (
                      <span key={s} className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.skills || []).map((s: string) => (
                    <span key={s} className="text-xs px-2 py-1 rounded-full bg-muted">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}