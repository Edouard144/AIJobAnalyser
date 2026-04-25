import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Users, Clock, Search, Loader2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jobsApi, activityApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function Jobs() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Closed' | 'Draft'>('All');
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({ title: '', department: '', location: '', type: 'Full-time', description: '', experienceYears: 0 });

  useEffect(() => {
    jobsApi.getAll()
      .then(async (res: any) => {
        const jobsArray = Array.isArray(res) ? res : (res?.data || []);
        const jobsWithCounts = await Promise.all(
          jobsArray.map(async (j: any) => {
            try {
              const cands: any = await jobsApi.getCandidates(j.id);
              const count = Array.isArray(cands) ? cands.length : (cands?.data?.length || 0);
              return { ...j, _count: { candidates: count } };
            } catch { return { ...j, _count: { candidates: 0 } }; }
          })
        );
        setJobs(jobsWithCounts);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchesSearch = !q || j.title?.toLowerCase().includes(q);
    const jobStatus = j.status?.toLowerCase() || 'open';
    if (filter === 'All') return matchesSearch;
    if (filter === 'Active') return matchesSearch && (jobStatus === 'open' || jobStatus === 'screening');
    return matchesSearch && jobStatus === filter.toLowerCase();
  });

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleCreate = async () => {
    try {
      const created: any = await jobsApi.create({ title: formData.title, description: formData.description || '', requiredSkills: skills, location: formData.location || 'Remote', experienceYears: formData.experienceYears || 0 });
      const jobId = created?.id || (created?.data as any)?.id;
      activityApi.create('job_created', jobId || '', `Created job "${formData.title}"`).catch(() => {});
      toast.success('Job posted!');
      const updated: any = await jobsApi.getAll();
      const arr = Array.isArray(updated) ? updated : (updated?.data || []);
      const withCounts = await Promise.all(arr.map(async (j: any) => {
        try { const c: any = await jobsApi.getCandidates(j.id); return { ...j, _count: { candidates: Array.isArray(c) ? c.length : (c?.data?.length || 0) } }; }
        catch { return { ...j, _count: { candidates: 0 } }; }
      }));
      setJobs(withCounts);
      setOpen(false); setStep(1); setSkills([]);
      setFormData({ title: '', department: '', location: '', type: 'Full-time', description: '', experienceYears: 0 });
    } catch (err: any) { toast.error(String(err.message || err)); }
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
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-2">Management</span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
            Jobs <span className="text-white/20">Board.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-3">Manage your open positions</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-10 bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl">
              <Plus className="h-3.5 w-3.5" />Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl bg-[#0d0d0d] border border-white/10 rounded-2xl text-white">
            <DialogHeader>
              <DialogTitle className="text-sm font-black uppercase tracking-[0.3em] text-white/60">New Position</DialogTitle>
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-wider transition-all', step >= s ? 'bg-white text-black' : 'bg-white/5 text-white/20')}>{s}</div>
                    {s < 3 && <div className={cn('flex-1 h-[1px] mx-2 transition-all', step > s ? 'bg-white/30' : 'bg-white/5')} />}
                  </div>
                ))}
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-2" key={step}>
              {step === 1 && (
                <>
                  <div className="space-y-2"><Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Job Title</Label><Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Senior Backend Engineer" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-11" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Department</Label><Input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} placeholder="Engineering" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-11" /></div>
                    <div className="space-y-2"><Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Location</Label><Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Remote" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-11" /></div>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="space-y-2"><Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Description</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder="Describe the role..." className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl resize-none" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Required Skills (press Enter)</Label>
                      <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="Type a skill..." className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-11" />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {skills.map(s => (
                          <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-white text-[10px] font-black uppercase tracking-wider">
                            {s}<button onClick={() => setSkills(skills.filter(x => x !== s))} className="hover:text-white/50 ml-1">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Min. Experience (yrs)</Label>
                      <Input type="number" min="0" max="30" value={formData.experienceYears} onChange={e => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })} placeholder="0" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl h-11" />
                    </div>
                  </div>
                </>
              )}
              {step === 3 && (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Review posting</p>
                  <p className="text-2xl font-black text-white tracking-tight">{formData.title || 'Untitled'}</p>
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{skills.length} required skills · {formData.experienceYears || 0}+ years exp</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{formData.location || 'Remote'} · {formData.type || 'Full-time'}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : setOpen(false)} className="text-white/30 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-wider rounded-xl">
                {step > 1 ? 'Back' : 'Cancel'}
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} className="bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl">Next</Button>
              ) : (
                <Button onClick={handleCreate} className="bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl">Publish Job</Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search positions..." className="pl-10 h-10 bg-white/[0.02] border-white/5 text-white placeholder:text-white/20 rounded-xl text-sm focus:border-white/20 transition-all" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/5">
          {(['All', 'Active', 'Closed', 'Draft'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all', filter === f ? 'bg-white text-black' : 'text-white/30 hover:text-white')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white/[0.02] border border-white/5 rounded-2xl py-20 text-center">
            <Briefcase className="h-8 w-8 text-white/10 mx-auto mb-4" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">No positions found</p>
          </div>
        ) : filtered.map((job, i) => (
          <Link
            key={job.id} to={`/jobs/${job.id}`}
            className="group bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/15 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-lg group-hover:bg-white/10 transition-colors">💼</div>
              <span className={cn('text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg',
                job.status === 'open' ? 'bg-white/10 text-white/50' :
                job.status === 'screening' ? 'bg-white/10 text-white/50' :
                'bg-white/5 text-white/25'
              )}>{job.status || 'open'}</span>
            </div>
            <h3 className="font-black text-white tracking-tight text-base mb-1 group-hover:text-white transition-colors leading-tight">{job.title}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25 mb-4">
              {job.department || 'Engineering'} · {job.type || 'Full-time'}
              {job.experienceYears != null && ` · ${job.experienceYears}+ yrs`}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {((job.requiredSkills || job.skills) || []).slice(0, 3).map((s: string) => (
                <span key={s} className="text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-lg bg-white/5 text-white/30">{s}</span>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/20"><MapPin className="h-2.5 w-2.5" />{job.location || 'Remote'}</span>
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/20"><Users className="h-2.5 w-2.5" />{job._count?.candidates || 0}</span>
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/20"><Clock className="h-2.5 w-2.5" />{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
