'use client';

import { useState, useEffect } from 'react';
import { Search, Upload, LayoutGrid, List, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jobsApi, screeningApi, activityApi } from '@/lib/api';
import { ScoreRing } from '@/components/ScoreRing';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { GradientAvatar } from '@/components/Avatar';

type Candidate = {
  id: string;
  firstName?: string; lastName?: string; fullName?: string; email?: string; phone?: string;
  skills?: Array<{ name: string; level?: string; yearsOfExperience?: number } | string>;
  experienceYears?: number; educationLevel?: string; currentPosition?: string;
  matchScore?: number; status?: string; strengths?: string[]; gaps?: string[]; recommendation?: string; createdAt?: string;
};

export default function Candidates() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [view, setView] = useState<'table' | 'card'>('card');
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadCandidatesForJob = async (jobId: string) => {
    if (jobId === 'all') {
      const results = await Promise.all(jobs.map((j: any) => jobsApi.getCandidates(j.id)));
      const combined = results.flatMap((r: any) => r.data || r || []);
      setCandidates(combined); setAllCandidates(combined);
    } else {
      const cands: any = await jobsApi.getCandidates(jobId);
      setCandidates(Array.isArray(cands) ? cands : (cands?.data || []));
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res: any = await jobsApi.getAll();
        const jobsArray = Array.isArray(res) ? res : (res?.data || []);
        const jobsWithCounts = await Promise.all(jobsArray.map(async (j: any) => {
          try { const c: any = await jobsApi.getCandidates(j.id); return { ...j, _count: { candidates: Array.isArray(c) ? c.length : (c?.data?.length || 0) } }; }
          catch { return { ...j, _count: { candidates: 0 } }; }
        }));
        setJobs(jobsWithCounts);
        if (jobsWithCounts.length > 0) { setLoading(true); await loadCandidatesForJob('all'); }
      } catch { setJobs([]); setCandidates([]); } finally { setLoading(false); }
    };
    loadJobs();
  }, []);

  useEffect(() => { if (jobs.length > 0) loadCandidatesForJob(selectedJob); }, [selectedJob, jobs]);

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
    if (!file || !selectedJob) { toast.error('Please select a job first'); return; }
    setUploading(true);
    try {
      const result: any = await jobsApi.uploadCandidates(selectedJob, file);
      const count = result?.inserted || result?.candidates?.length || 0;
      toast.success(`${count} candidate${count !== 1 ? 's' : ''} uploaded!`);
      setUploadOpen(false);
      const cands: any = await jobsApi.getCandidates(selectedJob);
      const uploaded = Array.isArray(cands) ? cands : (cands?.data || []);
      setCandidates(uploaded);
      activityApi.create('candidates_uploaded', selectedJob, { count: uploaded.length }).catch(() => {});
    } catch (err: any) { toast.error(err.message); } finally { setUploading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-2">Pipeline</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
            Candidates <span className="text-white/20">Pool.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-3">
            {filtered.length} candidates · {topMatches} top matches
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedJob}
            onChange={e => setSelectedJob(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-[0.1em] focus:outline-none focus:border-white/20 transition-all"
          >
            <option value="all">All Jobs</option>
            {jobs.map((j: any) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-10 bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl">
                <Upload className="h-3.5 w-3.5" />Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-[#0d0d0d] border border-white/10 rounded-2xl text-white">
              <DialogHeader><DialogTitle className="text-sm font-black uppercase tracking-[0.3em] text-white/60">Upload Candidates</DialogTitle></DialogHeader>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={cn('rounded-2xl border border-dashed p-12 text-center transition-all cursor-pointer mt-2',
                  dragOver ? 'border-white/30 bg-white/5' : 'border-white/10 hover:border-white/20')}
              >
                <div className="mx-auto h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-white/30" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50 mb-1">Drop CSV or Excel here</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">CSV or Excel · max 10MB</p>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" id="csv-upload" />
                <label htmlFor="csv-upload">
                  <span className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
                    {uploading ? 'Uploading...' : 'Browse files'}
                  </span>
                </label>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates..." className="pl-10 h-10 bg-white/[0.02] border-white/5 text-white placeholder:text-white/20 rounded-xl text-sm focus:border-white/20 transition-all" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/5">
          {[['all', 'All'], ['high', '85%+'], ['mid', '60–84%'], ['low', '<60%']].map(([val, label]) => (
            <button key={val} onClick={() => setScoreFilter(val as any)}
              className={cn('px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all',
                scoreFilter === val ? 'bg-white text-black' : 'text-white/30 hover:text-white')}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/5 ml-auto">
          <button onClick={() => setView('card')} className={cn('p-2 rounded-lg transition-all', view === 'card' ? 'bg-white text-black' : 'text-white/30 hover:text-white')}><LayoutGrid className="h-3.5 w-3.5" /></button>
          <button onClick={() => setView('table')} className={cn('p-2 rounded-lg transition-all', view === 'table' ? 'bg-white text-black' : 'text-white/30 hover:text-white')}><List className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl py-20 text-center">
          <Users className="h-8 w-8 text-white/10 mx-auto mb-4" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">No candidates found</p>
        </div>
      )}

      {/* Card View */}
      {view === 'card' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c, i) => {
            const name = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown';
            const score = c.matchScore;
            return (
              <button key={c.id} onClick={() => setSelected(c)}
                className="group bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-left hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}>
                <div className="flex items-start gap-3 mb-4">
                  <GradientAvatar name={name} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.05em] text-white truncate">{name}</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/25 truncate mt-0.5">{c.currentPosition || c.email}</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/15 mt-0.5">{c.experienceYears ?? 0} yrs exp</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {score != null && score > 0 ? (
                    <ScoreRing score={score} size={44} stroke={5} />
                  ) : (
                    <div className="h-11 w-11 flex items-center justify-center rounded-full bg-white/5">
                      <span className="text-[9px] font-black text-white/20">—</span>
                    </div>
                  )}
                  <div className="text-right">
                    <span className={cn('text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg',
                      score != null && score > 0 && score >= 85 ? 'bg-white/10 text-white/50' :
                      score != null && score > 0 && score >= 60 ? 'bg-white/5 text-white/35' :
                      score != null && score > 0 ? 'bg-white/5 text-white/25' : 'bg-white/5 text-white/15'
                    )}>{score != null && score > 0 ? (c.status || 'Screened') : 'Pending'}</span>
                    <div className="mt-1.5 flex flex-wrap gap-1 justify-end">
                      {(c.skills || []).slice(0, 2).map((s: any, idx: number) => {
                        const skillName = typeof s === 'string' ? s : (s.name || '');
                        return skillName ? <span key={skillName || idx} className="text-[8px] font-black uppercase tracking-[0.05em] px-1.5 py-0.5 rounded-md bg-white/5 text-white/25">{skillName}</span> : null;
                      })}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && filtered.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Name', 'Email', 'Position', 'Score', 'Status'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[8px] font-black uppercase tracking-[0.3em] text-white/20">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => setSelected(c)} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors">
                  <td className="px-6 py-4 text-[11px] font-bold text-white/70">{c.fullName || `${c.firstName || ''} ${c.lastName || ''}`}</td>
                  <td className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.1em] text-white/25">{c.email}</td>
                  <td className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.1em] text-white/40">{c.currentPosition || '—'}</td>
                  <td className="px-6 py-4">{c.matchScore != null && c.matchScore > 0 ? <ScoreRing score={c.matchScore} size={32} /> : <span className="text-white/20 text-xs">—</span>}</td>
                  <td className="px-6 py-4"><span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg bg-white/5 text-white/30">{c.matchScore != null && c.matchScore > 0 ? (c.status || 'Screened') : 'Pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-[#0d0d0d] border-l border-white/10 text-white">
          {selected && (
            <div className="space-y-8 pt-6">
              <div className="flex items-start gap-4">
                <GradientAvatar name={selected.fullName || `${selected.firstName || ''} ${selected.lastName || ''}`} size={56} />
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">{selected.fullName || `${selected.firstName || ''} ${selected.lastName || ''}`}</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-1">{selected.currentPosition || selected.email}</p>
                </div>
              </div>

              <div className="flex gap-6 items-center">
                {selected.matchScore != null && selected.matchScore > 0 ? (
                  <ScoreRing score={selected.matchScore} size={80} />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">N/A</span>
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Experience</p>
                    <p className="text-[11px] font-bold text-white/60 mt-0.5">{selected.experienceYears || 0} years</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Education</p>
                    <p className="text-[11px] font-bold text-white/60 mt-0.5">{selected.educationLevel || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {(selected.strengths?.length || 0) > 0 && (
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Strengths</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.strengths?.map(s => <span key={s} className="text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg bg-white/10 text-white/50">{s}</span>)}
                  </div>
                </div>
              )}

              {(selected.gaps?.length || 0) > 0 && (
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Improvement Areas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.gaps?.map(s => <span key={s} className="text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg bg-white/5 text-white/30">{s}</span>)}
                  </div>
                </div>
              )}

              {(selected.skills?.length || 0) > 0 && (
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selected.skills || []).map((s, i) => {
                      const name = typeof s === 'string' ? s : (s.name || '');
                      return <span key={name || i} className="text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg bg-white/5 text-white/40">{name}</span>;
                    })}
                  </div>
                </div>
              )}

              {selected.recommendation && (
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">AI Recommendation</p>
                  <p className="text-[11px] text-white/40 leading-relaxed font-medium">{selected.recommendation}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}