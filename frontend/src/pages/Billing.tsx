'use client';

import { useState, useEffect } from 'react';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { billingApi } from '@/lib/api';
import { toast } from 'sonner';

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
    } catch (err: any) {
      toast.error(err.message || 'Failed to update plan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userPlanId = currentPlan?.plan || 'pro';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          You're currently on the <span className="text-primary font-semibold">{userPlanId}</span> plan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p, i) => {
          const isCurrent = userPlanId?.toLowerCase() === p.id;
          return (
            <div
              key={p.id}
              className={`relative glass rounded-2xl p-6 animate-fade-in-up ${p.popular ? 'border-primary glow-primary md:scale-105' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {p.popular && !isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />Most popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success text-success-foreground text-[10px] font-bold uppercase tracking-wider">
                  Current plan
                </span>
              )}
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{p.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-display font-bold">${p.price}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">{p.price === 0 ? 'Free forever' : 'Billed monthly'}</p>
              <ul className="space-y-2.5 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button className="w-full" variant="outline" disabled>Current plan</Button>
              ) : (
                <Button
                  onClick={() => handleUpdatePlan(p.id)}
                  className={`w-full ${p.popular ? 'bg-gradient-primary glow-primary' : ''}`}
                >
                  {p.price > (plans.find(pl => pl.id === userPlanId)?.price || 0) ? 'Upgrade' : 'Downgrade'}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {invoices.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Billing history</h3>
          <div className="space-y-2">
            {invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-sm">{inv.description || 'Subscription'}</p>
                  <p className="text-xs text-muted-foreground">{inv.date || inv.createdAt ? new Date(inv.date || inv.createdAt).toLocaleDateString() : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">${inv.amount || 0}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    inv.status === 'paid' ? 'bg-success/10 text-success' :
                    inv.status === 'pending' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>{inv.status || 'paid'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}