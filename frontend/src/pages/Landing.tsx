import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Zap, ShieldCheck, Users, Brain, BarChart3, Globe,
  Check, X, Play, ChevronRight, Bot, Target, Clock, TrendingUp, Plus, Minus, MapPin,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { GradientAvatar } from '@/components/Avatar';
import { COMPANY_LOGOS } from '@/components/CompanyLogo';
import { SquiggleUnderline, SquiggleArrow } from '@/components/SquiggleUnderline';
import { CursorSpotlight } from '@/components/CursorSpotlight';
import { Kbd } from '@/components/Kbd';
import { useParallax } from '@/hooks/useParallax';
import { AnimatedCounter } from '@/components/AnimatedCounter';



const features = [
  { icon: Brain, title: 'AI résumé screening', desc: 'Parse and rank hundreds of CVs in under 10 seconds with deep skill matching.' },
  { icon: Target, title: 'Explainable scoring', desc: 'Every 0–100 score comes with strengths, gaps, and a hiring recommendation.' },
  { icon: Bot, title: 'Recruiter assistant', desc: 'Ask in plain English: "Best backend candidate from Lagos with AWS?"' },
  { icon: BarChart3, title: 'Pipeline analytics', desc: 'Real-time dashboards on screening volume, quality, and time-to-hire.' },
  { icon: ShieldCheck, title: 'Bias-aware hiring', desc: 'Auditable decisions and fairness checks built into every screening.' },
  { icon: Globe, title: 'Multilingual', desc: 'Native support for English, Kinyarwanda, Kiswahili, and French.' },
];

const steps = [
  { n: '01', title: 'Post a job', desc: 'Create an opening in seconds with AI-suggested requirements.' },
  { n: '02', title: 'Upload candidates', desc: 'Drag & drop résumés — PDF, CSV, or JSON. Bulk upload supported.' },
  { n: '03', title: 'Run AI screening', desc: 'Watch the scan rank every candidate in under 10 seconds.' },
  { n: '04', title: 'Hire the best', desc: 'Review the leaderboard, approve top picks, and schedule interviews.' },
];

const stats = [
  { value: 2400, suffix: '+', label: 'Recruiters' },
  { value: 180, suffix: 'k', label: 'Résumés screened' },
  { value: 92, suffix: '%', label: 'Time saved' },
  { value: 4.9, suffix: '/5', label: 'User rating', float: true },
];

const faqs = [
  {
    q: 'Will the AI replace my judgement?',
    a: 'No — and that is the point. AIRECRUIT ranks and explains, but every hire decision stays with you. Think of it as the world’s most patient teammate that read every CV before your morning coffee.',
  },
  {
    q: 'How is this different from our existing ATS?',
    a: 'Most ATSes are filing cabinets. They store résumés but make you read them. AIRECRUIT actually reads, scores, and explains — so you only spend time on the candidates worth your time.',
  },
  {
    q: 'What about bias?',
    a: 'Every score is auditable: you see the exact reasoning. We strip names, photos, and demographic signals from the screening pass by default, and we publish a quarterly fairness report.',
  },
  {
    q: 'Do you support languages other than English?',
    a: 'Yes — English, French, Kinyarwanda, and Kiswahili at launch, with Arabic and Portuguese coming next.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No annual lock-in on Starter or Pro. Cancel from settings — keeps everything until end of billing period.',
  },
];

const comparison = [
  { feature: 'Auto-rank candidates by job fit',  us: true,  ats: false },
  { feature: 'Explainable score (strengths + gaps)', us: true, ats: false },
  { feature: 'Natural-language search across pipeline', us: true, ats: false },
  { feature: 'Bias-aware blind screening',       us: true,  ats: 'Add-on' as const },
  { feature: 'Multilingual résumé parsing',      us: true,  ats: 'Limited' as const },
  { feature: 'Setup in under 5 minutes',         us: true,  ats: false },
  { feature: 'Job board posting integrations',   us: true,  ats: true },
  { feature: 'Interview scheduling',             us: true,  ats: true },
];

export default function Landing() {
  const scrollY = useParallax();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Parallax orbs */}
      <div
        className="orb h-[600px] w-[600px] bg-primary/20 -top-48 -left-48 fixed"
        style={{ transform: `translate3d(0, ${scrollY * 0.15}px, 0)` }}
      />
      <div
        className="orb h-[500px] w-[500px] bg-primary-glow/15 top-1/3 -right-40 fixed"
        style={{ animationDelay: '4s', transform: `translate3d(0, ${scrollY * -0.1}px, 0)` }}
      />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      {/* ========== NAV ========== */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              AI<span className="text-gradient">RECRUIT</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#compare" className="text-muted-foreground hover:text-foreground transition-colors">Compare</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
            <Link to="/login" className="hidden sm:inline-block ml-2">
              <Button variant="ghost" size="sm" className="press">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="press bg-gradient-primary text-primary-foreground glow-primary">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ========== HERO with cursor spotlight ========== */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <CursorSpotlight />
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Asymmetric layout — text left-of-center, mockup floats right */}
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 lg:pr-8 text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20 text-xs font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Now with multilingual AI screening
                <ChevronRight className="h-3 w-3" />
              </div>

              <h1 className="text-display text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[0.95] mb-6">
                Stop reading 400 CVs.<br />
                <span className="relative inline-block">
                  <span className="text-gradient">Read the 5</span>
                  <SquiggleUnderline />
                </span>
                {' '}that matter.
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed animate-fade-in-up delay-step-2">
                AIRECRUIT ranks every candidate in under 10 seconds — with explainable scoring,
                bias checks, and a recruiter assistant that actually understands your roles.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8 animate-fade-in-up delay-step-3">
                <Link to="/register">
                  <Button size="lg" className="press h-12 px-7 bg-gradient-primary text-primary-foreground font-semibold glow-primary group">
                    Start screening for free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="press h-12 px-7 gap-2 hover:border-primary/40">
                  <Play className="h-4 w-4 fill-current" />
                  Watch 2-min demo
                </Button>
                <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                  or press <Kbd>⌘</Kbd><Kbd>K</Kbd>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex -space-x-2">
                  {['Sarah Kagame', 'Marcus Lwanga', 'Aiden Okonkwo', 'Maya Patel'].map((n) => (
                    <GradientAvatar key={n} name={n} size="xs" className="ring-2 ring-background" />
                  ))}
                </div>
                <span>Joined by <span className="font-semibold text-foreground tabular">2,400+</span> recruiters this month</span>
              </div>
            </div>

            {/* Hero product mockup — floats slightly off-center */}
            <div className="lg:col-span-5 relative animate-fade-in-up delay-step-4">
              <SquiggleArrow className="hidden lg:block absolute -left-16 -top-4 rotate-[-15deg] opacity-70" />
              <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-20 rounded-3xl" />
              <div className="relative glass-strong rounded-2xl p-2 shadow-elegant lg:rotate-1 lg:hover:rotate-0 transition-transform duration-500">
                <div className="rounded-xl bg-card overflow-hidden border border-border">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-destructive/60" />
                      <div className="h-3 w-3 rounded-full bg-warning/60" />
                      <div className="h-3 w-3 rounded-full bg-success/60" />
                    </div>
                    <div className="flex-1 mx-4 h-6 rounded-md bg-background/60 text-[10px] flex items-center justify-center text-muted-foreground tabular">
                      app.airecruit.io/screenings
                    </div>
                  </div>
                  <div className="p-5 space-y-3 bg-gradient-to-br from-background to-muted/20">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Candidates', value: '247', icon: Users },
                        { label: 'Avg. score', value: '84%', icon: TrendingUp },
                        { label: 'Time saved', value: '12h', icon: Clock },
                      ].map((s, i) => (
                        <div key={i} className="rounded-lg p-3 bg-card border border-border text-left">
                          <s.icon className="h-3.5 w-3.5 text-primary mb-1" />
                          <p className="text-lg font-display font-bold tabular">{s.value}</p>
                          <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg p-4 bg-card border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-xs">Top candidates · Backend</p>
                        <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">AI ranked</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { name: 'Aiden Okonkwo', score: 94 },
                          { name: 'Maya Patel', score: 89 },
                          { name: 'David Kim', score: 82 },
                        ].map((c, i) => (
                          <div key={i} className="flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: `${600 + i * 80}ms` }}>
                            <GradientAvatar name={c.name} size="xs" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs font-medium">{c.name}</span>
                                <span className="text-[10px] font-semibold text-primary tabular">{c.score}%</span>
                              </div>
                              <div className="h-1 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${c.score}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Annotated callout */}
              <div className="hidden lg:flex absolute -right-4 top-32 items-center gap-2 animate-fade-in-up delay-step-6">
                <div className="glass rounded-lg px-3 py-1.5 text-xs font-serif-accent text-primary shadow-elegant">
                  ranked in 8.4s ✨
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== LOGOS ========== */}
      <section className="py-12 px-6 border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
            Trusted by recruiting teams across Africa & beyond
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 text-muted-foreground/70">
            {COMPANY_LOGOS.map((Logo, i) => (
              <Logo key={i} className="hover:text-foreground transition-colors animate-fade-in" />
            ))}
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 text-center hover:border-primary/30 transition-all animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <p className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2 tabular">
                {s.float ? s.value.toFixed(1) : <AnimatedCounter value={s.value} />}{s.suffix}
              </p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== FEATURES — asymmetric with one big card ========== */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">Features</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Everything you need to <span className="text-gradient">hire 10x faster</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              From AI screening to analytics — a complete, opinionated toolkit for modern recruiting teams.
            </p>
          </div>

          {/* Asymmetric bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Big feature */}
            <div className="md:col-span-4 glass-strong rounded-2xl p-8 hover:border-primary/40 transition-all group relative overflow-hidden animate-fade-in-up">
              <div className="absolute -right-12 -bottom-12 h-48 w-48 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-2">{features[0].title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">{features[0].desc}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded-md bg-success/10 text-success font-semibold tabular">~8s avg</span>
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold">PDF · DOCX · JSON</span>
                </div>
              </div>
            </div>

            {/* Small features */}
            {features.slice(1).map((f, i) => (
              <div
                key={i}
                className={`glass rounded-2xl p-6 hover:border-primary/40 hover:-translate-y-1 transition-all group animate-fade-in-up ${
                  i === 0 ? 'md:col-span-2' :
                  i === 1 ? 'md:col-span-3' :
                  i === 2 ? 'md:col-span-3' :
                  i === 3 ? 'md:col-span-2' :
                  'md:col-span-4'
                }`}
                style={{ animationDelay: `${(i + 1) * 60}ms` }}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how" className="py-24 px-6 bg-muted/20 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">How it works</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              From job post to top hire in <span className="text-gradient">4 steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div
                key={i}
                className="relative glass rounded-2xl p-6 hover:border-primary/40 transition-all animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="text-5xl font-display font-bold text-primary/10 absolute top-4 right-4 tabular">{s.n}</span>
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold mb-4 glow-primary tabular">
                  {i + 1}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMPARISON TABLE ========== */}
      <section id="compare" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">Comparison</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              AIRECRUIT vs. <span className="text-gradient">a traditional ATS</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Most ATSes store résumés. We read them.
            </p>
          </div>

          <div className="glass-strong rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-4 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <div className="col-span-6">Capability</div>
              <div className="col-span-3 text-center">AIRECRUIT</div>
              <div className="col-span-3 text-center">Traditional ATS</div>
            </div>
            {comparison.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-12 px-6 py-4 items-center border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <div className="col-span-6 text-sm">{row.feature}</div>
                <div className="col-span-3 flex justify-center">
                  {row.us ? (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>
                <div className="col-span-3 flex justify-center">
                  {row.ats === true ? (
                    <Check className="h-5 w-5 text-muted-foreground" />
                  ) : row.ats === false ? (
                    <X className="h-5 w-5 text-muted-foreground/40" />
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">{row.ats}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ========== PRICING ========== */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Simple, <span className="text-gradient">transparent pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Start free. Upgrade when you're ready. No credit card required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {[
              { name: 'Starter', price: '$0', desc: 'For small teams getting started', features: ['5 active jobs', '50 candidates / mo', 'Basic AI screening'] },
              { name: 'Pro', price: '$30', popular: true, desc: 'For growing recruiting teams', features: ['Unlimited jobs', 'Unlimited candidates', 'Advanced AI + assistant', 'Team collaboration'] },
              { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['Everything in Pro', 'SSO & SAML', 'Dedicated success manager'] },
            ].map((p, i) => (
              <div
                key={p.name}
                className={`relative glass-strong rounded-2xl p-6 animate-fade-in-up ${p.popular ? 'border-primary glow-primary md:scale-105' : ''}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />Popular
                  </span>
                )}
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{p.name}</p>
                <p className="text-4xl font-display font-bold mb-1 tabular">
                  {p.price}<span className="text-sm text-muted-foreground font-normal">{p.price !== 'Custom' && '/mo'}</span>
                </p>
                <p className="text-xs text-muted-foreground mb-5">{p.desc}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="block">
                  <Button className={`press w-full ${p.popular ? 'bg-gradient-primary text-primary-foreground glow-primary' : ''}`} variant={p.popular ? 'default' : 'outline'}>
                    Get started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section id="faq" className="py-24 px-6 bg-muted/20 border-y border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-3">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Honest answers to <span className="text-gradient">honest questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="glass rounded-2xl overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="press w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-muted/20 transition-colors"
                  >
                    <span className="font-semibold">{f.q}</span>
                    {isOpen ? <Minus className="h-4 w-4 text-primary shrink-0" /> : <Plus className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed animate-fade-in">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="glass-strong rounded-3xl p-10 md:p-16 text-center relative overflow-hidden border border-primary/20">
            <div className="absolute -top-32 -right-32 h-64 w-64 bg-primary/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-64 w-64 bg-primary-glow/20 rounded-full blur-3xl" />
            <div className="relative">
              <Zap className="h-10 w-10 text-primary mx-auto mb-5" />
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Ready to <span className="text-gradient">10x your hiring?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join 2,400+ recruiters who screen smarter with AIRECRUIT. Free to start, no card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register">
                  <Button size="lg" className="press h-12 px-7 bg-gradient-primary text-primary-foreground font-semibold glow-primary group">
                    Start free today
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="press h-12 px-7">Sign in</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold tracking-tight">
                  AI<span className="text-gradient">RECRUIT</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                The AI-powered hiring platform built for modern recruiting teams.
              </p>
              <p className="text-xs text-muted-foreground font-serif-accent inline-flex items-center gap-1.5">
                <MapPin className="h-3 w-3" /> Made with care in Kigali, Rwanda 🇷🇼
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'DPA'] },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-semibold text-sm mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground tabular">© 2026 AIRECRUIT. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Built by recruiters, for recruiters.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
