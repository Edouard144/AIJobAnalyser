'use client';

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Clock, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jobsApi, screeningApi } from '@/lib/api';
import { ScoreRing } from '@/components/ScoreRing';
import { GradientAvatar } from '@/components/Avatar';
import { cn } from '@/lib/utils';

export default function JobDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);

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
          <Link to="/screenings">
            <Button className="gap-2 bg-gradient-primary glow-primary">
              <Sparkles className="h-4 w-4" />Run AI Screening
            </Button>
          </Link>
        </div>

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
            <Link to="/candidates">
              <Button variant="outline">Add Candidates</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {candidates.slice(0, 8).map((c: any, i: number) => {
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
                      {c.experienceYears || 0} years exp · {(c.skills || []).slice(0, 3).join(', ')}
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