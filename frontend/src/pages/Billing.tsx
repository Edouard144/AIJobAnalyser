'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { billingApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const plans = [
  { id: 'starter', name: 'Starter', price: 0, features: ['5 jobs', '50 candidates', 'Basic AI screening', 'Email support'] },
  { id: 'pro', name: 'Pro', price: 30, popular: true, features: ['Unlimited jobs', 'Unlimited candidates', 'Advanced AI screening', 'Priority support', 'Team collaboration', 'Custom integrations'] },
  { id: 'enterprise', name: 'Enterprise', price: 99, features: ['Everything in Pro', 'Dedicated success manager', 'SSO & SAML', 'Advanced analytics', 'Custom AI models'] },
];

export default function Billing() {
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      billingApi.getPlan().catch(() => null),
      billingApi.getInvoices().catch(() => []),
    ]).then(([plan, inv]) => {
      setCurrentPlan(plan);
      setInvoices(Array.isArray(inv) ? inv : ((inv as any)?.data || []));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpdatePlan = async (planId: string) => {
    try {
      await billingApi.updatePlan(planId);
      toast.success('Plan updated!');
      const updated = await billingApi.getPlan();
      setCurrentPlan(updated);
    } catch (err: any) { toast.error(err.message || 'Failed to update plan'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-white/30" />
    </div>
  );

  const userPlanId = currentPlan?.plan || 'pro';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-up">
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-2">Subscription</span>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
          Billing <span className="text-white/20">Plans.</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-3">
          Active protocol: <span className="text-white/50">{userPlanId}</span>
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p, i) => {
          const isCurrent = userPlanId?.toLowerCase() === p.id;
          return (
            <div
              key={p.id}
              className={cn(
                'relative bg-white/[0.02] border rounded-2xl p-6 animate-fade-in-up transition-all duration-300',
                p.popular ? 'border-white/20 bg-white/[0.04]' : 'border-white/5',
                isCurrent && 'border-white/30'
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {p.popular && !isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-white text-black text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                  Most Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-white/20 text-white text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap border border-white/30">
                  Active
                </span>
              )}

              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/25 mb-3">{p.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-white tracking-tighter">${p.price}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/25">/mo</span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">{p.price === 0 ? 'Free forever' : 'Billed monthly'}</p>

              <ul className="space-y-3 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5 text-white/60" />
                    </div>
                    <span className="text-[10px] font-bold text-white/50">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button className="w-full h-10 bg-white/5 border border-white/10 text-white/30 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl cursor-not-allowed" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleUpdatePlan(p.id)}
                  className={cn(
                    'w-full h-10 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all',
                    p.popular
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-transparent border border-white/10 text-white/40 hover:bg-white/5 hover:text-white hover:border-white/20'
                  )}
                >
                  {p.price > (plans.find(pl => pl.id === userPlanId)?.price || 0) ? 'Upgrade' : 'Downgrade'}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Invoice History */}
      {invoices.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-5">Transaction Log</p>
          <div className="space-y-2">
            {invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-[11px] font-bold text-white/60">{inv.description || 'Subscription'}</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 mt-0.5">{inv.date || inv.createdAt ? new Date(inv.date || inv.createdAt).toLocaleDateString() : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">${inv.amount || 0}</p>
                  <span className={cn('text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg',
                    inv.status === 'paid' ? 'bg-white/10 text-white/40' :
                    inv.status === 'pending' ? 'bg-white/5 text-white/30' : 'bg-white/5 text-white/20'
                  )}>{inv.status || 'paid'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}