import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Users, Clock, Search, Loader2, Trash2, Briefcase } from 'lucide-react';
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
  const [formData, setFormData] = useState({ 
    title: '', 
    department: '', 
    location: '', 
    type: 'Full-time', 
    description: '',
    experienceYears: 0
  });

  useEffect(() => {
    jobsApi.getAll()
      .then(async (res: any) => {
        const jobsArray = Array.isArray(res) ? res : (res?.data || []);
        
        // Fetch actual candidate counts for each job
        const jobsWithCounts = await Promise.all(
          jobsArray.map(async (j: any) => {
            try {
              const cands: any = await jobsApi.getCandidates(j.id);
              const count = Array.isArray(cands) ? cands.length : (cands?.data?.length || 0);
              return { ...j, _count: { candidates: count } };
            } catch {
              return { ...j, _count: { candidates: 0 } };
            }
          })
        );
        
        setJobs(jobsWithCounts);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    const jobStatus = j.status?.toLowerCase() || 'open';
    if (filter === 'All') return true;
    if (filter === 'Active') return jobStatus === 'open' || jobStatus === 'screening';
    return jobStatus === filter.toLowerCase();
  });

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

const handleCreate = async () => {
    const jobData = {
      title: formData.title,
      description: formData.description || '',
      requiredSkills: skills,
      location: formData.location || 'Remote',
      experienceYears: formData.experienceYears || 0,
    };
    
    try {
      const created: any = await jobsApi.create(jobData);
      const jobId = created?.id || (created?.data as any)?.id;
      activityApi.create('job_created', jobId || '', `Created job "${formData.title}" with ${skills.length} skills`).catch(() => {});
      toast.success('Job posted!');
      
      // Refresh jobs list with candidate counts
      const updated: any = await jobsApi.getAll();
      const jobsArray = Array.isArray(updated) ? updated : (updated?.data || []);
      
      // Fetch counts for all jobs
      const jobsWithCounts = await Promise.all(
        jobsArray.map(async (j: any) => {
          try {
            const cands: any = await jobsApi.getCandidates(j.id);
            const count = Array.isArray(cands) ? cands.length : (cands?.data?.length || 0);
            return { ...j, _count: { candidates: count } };
          } catch {
            return { ...j, _count: { candidates: 0 } };
          }
        })
      );
      
      setJobs(jobsWithCounts);
      
      setOpen(false);
      setStep(1);
      setSkills([]);
             setFormData({ title: '', department: '', location: '', type: 'Full-time', description: '', experienceYears: 0 });
    } catch (err: any) {
      toast.error(String(err.message || err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job?')) return;
    try {
      await jobsApi.delete(id);
      setJobs(jobs.filter(j => j.id !== id));
      toast.success('Job deleted');
    } catch (err: any) {
      toast.error(err.message);
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
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground mt-1">Manage your open positions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-primary text-primary-foreground glow-primary">
              <Plus className="h-4 w-4" />Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="font-display">Create new job</DialogTitle>
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                      step >= s ? 'bg-gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                      {s}
                    </div>
                    {s < 3 && <div className={cn('flex-1 h-0.5 mx-2 transition-all', step > s ? 'bg-primary' : 'bg-muted')} />}
                  </div>
                ))}
              </div>
            </DialogHeader>

<div className="space-y-4 mt-2 animate-fade-in" key={step}>
              {step === 1 && (
                <>
                  <div className="space-y-1.5"><Label>Job title</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Senior Backend Engineer" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Department</Label>
                      <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="Engineering" />
                    </div>
                    <div className="space-y-1.5"><Label>Location</Label>
                      <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Remote" />
                    </div>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="space-y-1.5"><Label>Description</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder="Describe the role..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Required skills (press Enter)</Label>
                      <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="Type a skill..." />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {skills.map(s => (
                          <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium animate-scale-in">
                            {s}
                            <button onClick={() => setSkills(skills.filter(x => x !== s))} className="hover:text-destructive">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Minimum experience (years)</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          max="30"
                          value={formData.experienceYears}
                          onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Years of relevant experience required</p>
                    </div>
                  </div>
                </>
              )}
               {step === 3 && (
                <div className="rounded-xl bg-accent/40 p-4 text-sm space-y-2">
                  <p className="font-semibold">Review your job posting</p>
                  <p className="text-muted-foreground">Make sure everything looks right before publishing.</p>
                  <div className="pt-2 space-y-1">
                    <div><span className="font-medium">{formData.title || 'Untitled'}</span></div>
                    <div><span className="font-medium">{skills.length}</span> required skills</div>
                    <div><span className="font-medium">{formData.experienceYears || 0}</span> years minimum experience</div>
                    <div><span className="font-medium">{formData.location || 'Remote'}</span> · {formData.type || 'Full-time'}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : setOpen(false)}>
                {step > 1 ? 'Back' : 'Cancel'}
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} className="bg-gradient-primary">Next</Button>
              ) : (
                <Button onClick={handleCreate} className="bg-gradient-primary glow-primary">Publish job</Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="pl-10" />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {(['All', 'Active', 'Closed', 'Draft'] as const).map(f => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                filter === f ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* Job grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No jobs found. Create your first job!
          </div>
        ) : filtered.map((job, i) => (
          <Link
            key={job.id} to={`/jobs/${job.id}`}
            className="group glass rounded-2xl p-5 hover:scale-[1.02] hover:shadow-elegant hover:border-primary/40 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg">💼</div>
              <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full',
                job.status === 'open' && 'bg-success/10 text-success',
                job.status === 'screening' && 'bg-warning/10 text-warning',
                job.status === 'closed' && 'bg-muted text-muted-foreground',
              )}>{job.status || 'open'}</span>
            </div>
            <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {(job.department || 'Engineering')} · {(job.type || 'Full-time')}
              {job.experienceYears != null && ` · ${job.experienceYears}+ years`}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {((job.requiredSkills || job.skills) || []).slice(0, 3).map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location || 'Remote'}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job._count?.candidates || 0}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
