import { Check, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  { name: 'Starter', price: 0, features: ['5 jobs', '50 candidates', 'Basic AI screening', 'Email support'] },
  { name: 'Pro', price: 30, popular: true, features: ['Unlimited jobs', 'Unlimited candidates', 'Advanced AI screening', 'Priority support', 'Team collaboration', 'Custom integrations'] },
  { name: 'Enterprise', price: 99, features: ['Everything in Pro', 'Dedicated success manager', 'SSO & SAML', 'Advanced analytics', 'Custom AI models'] },
];

export default function Billing() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">You're currently on the <span className="text-primary font-semibold">Pro</span> plan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p, i) => (
          <div
            key={p.name}
            className={`relative glass rounded-2xl p-6 animate-fade-in-up ${p.popular ? 'border-primary glow-primary md:scale-105' : ''}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />Most popular
              </span>
            )}
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{p.name}</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-display font-bold">${p.price}</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">{p.name === 'Starter' ? 'Free forever' : 'Billed monthly'}</p>
            <ul className="space-y-2.5 mb-6">
              {p.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
            <Button className={`w-full ${p.popular ? 'bg-gradient-primary glow-primary' : ''}`} variant={p.popular ? 'default' : 'outline'}>
              {p.popular ? 'Current plan' : p.price > 30 ? 'Upgrade' : 'Downgrade'}
            </Button>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Payment method</h3>
        <div className="flex items-center gap-4">
          <div className="h-10 w-14 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-xs font-bold">VISA</div>
          <div className="flex-1">
            <p className="font-medium text-sm">•••• •••• •••• 4242</p>
            <p className="text-xs text-muted-foreground">Expires 12/27</p>
          </div>
          <Button variant="outline" size="sm">Update</Button>
        </div>
      </div>
    </div>
  );
}
