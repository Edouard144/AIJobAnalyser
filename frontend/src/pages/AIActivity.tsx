'use client';

import { useState, useEffect } from 'react';
import { Activity, Bot, Upload, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { activityApi } from '@/lib/api';

const getIcon = (action: string) => {
  if (action?.includes('screening') || action?.includes('Screening')) return Sparkles;
  if (action?.includes('upload') || action?.includes('Upload')) return Upload;
  if (action?.includes('candidate') || action?.includes('approve')) return CheckCircle2;
  if (action?.includes('AI') || action?.includes('chat')) return Bot;
  return Activity;
};

export default function AIActivity() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    activityApi.getAll()
      .then((res: any) => setActivities(res?.data || res || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-2">Audit</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
          Activity <span className="text-white/20">Log.</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-3">
          Every screening, upload, and system action
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl py-20 text-center">
          <Activity className="h-8 w-8 text-white/10 mx-auto mb-4" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
            No activity yet
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/15 mt-2">
            Start by creating a job or running a screening
          </p>
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Timeline line */}
          <div className="absolute left-[14px] top-2 bottom-2 w-px bg-white/5" />

          {activities.map((e: any, i: number) => {
            const Icon = getIcon(e.action);
            return (
              <div key={e.id || i} className="relative pb-5 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Dot */}
                <div className="absolute -left-8 h-5 w-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Icon className="h-2.5 w-2.5 text-white/30" />
                </div>

                {/* Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl px-5 py-4 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-white/60 leading-snug">{e.description || e.action}</p>
                      {(e.target || e.details) && (
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 mt-1 truncate">{e.target || e.details}</p>
                      )}
                      <span className="inline-block mt-2 text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg bg-white/5 text-white/20">
                        {e.action}
                      </span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/15 shrink-0 mt-0.5">
                      {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}