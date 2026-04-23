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

const getColor = (action: string) => {
  if (action?.includes('screening') || action?.includes('Screening')) return 'text-primary bg-primary/10';
  if (action?.includes('upload') || action?.includes('Upload')) return 'text-secondary bg-secondary/10';
  if (action?.includes('candidate') || action?.includes('approve')) return 'text-success bg-success/10';
  if (action?.includes('AI') || action?.includes('chat')) return 'text-primary bg-primary/10';
  return 'text-warning bg-warning/10';
};

export default function AIActivity() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    activityApi.getAll()
      .then((res: any) => {
        const data = res?.data || res || [];
        setActivities(data);
      })
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">AI Activity Log</h1>
        <p className="text-muted-foreground mt-1">Every screening, upload, and AI action</p>
      </div>

      {activities.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No activity yet. Start by creating a job or running a screening.</p>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[10px] top-2 bottom-2 w-px bg-border" />
          {activities.map((e: any, i: number) => {
            const Icon = getIcon(e.action);
            const color = getColor(e.action);
            return (
              <div key={e.id || i} className="relative pb-6 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`absolute -left-6 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center ${color}`}>
                  <Icon className="h-2.5 w-2.5" />
                </div>
                <div className="glass rounded-xl p-4 ml-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm">{e.action || 'Activity'}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'recently'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{e.description || e.target || e.details || ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}